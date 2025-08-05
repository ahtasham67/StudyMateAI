package com.studymate.backend.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.StringJoiner;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for extracting text content from various document formats
 */
@Service
public class DocumentTextExtractorService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentTextExtractorService.class);

    /**
     * Extract text from uploaded file based on its content type
     */
    public String extractTextFromFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();

        logger.info("Extracting text from file: {} (type: {})", originalFilename, contentType);

        if (contentType == null) {
            throw new IllegalArgumentException("Unable to determine file type");
        }

        try (InputStream inputStream = file.getInputStream()) {
            return extractTextFromStream(inputStream, contentType, originalFilename);
        }
    }

    /**
     * Extract text from byte array with known content type and filename
     */
    public String extractTextFromBytes(byte[] fileData, String contentType, String filename) throws IOException {
        logger.info("Extracting text from bytes: {} (type: {})", filename, contentType);

        if (contentType == null) {
            throw new IllegalArgumentException("Unable to determine file type");
        }

        try (InputStream inputStream = new ByteArrayInputStream(fileData)) {
            return extractTextFromStream(inputStream, contentType, filename);
        }
    }

    /**
     * Extract text from input stream based on content type
     */
    private String extractTextFromStream(InputStream inputStream, String contentType, String filename)
            throws IOException {
        if (contentType.equals("application/pdf") ||
                (filename != null && filename.toLowerCase().endsWith(".pdf"))) {
            return extractTextFromPDF(inputStream);
        } else if (contentType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation") ||
                (filename != null && filename.toLowerCase().endsWith(".pptx"))) {
            return extractTextFromPPTX(inputStream);
        } else {
            throw new IllegalArgumentException("Unsupported file type: " + contentType);
        }
    }

    /**
     * Extract text from PDF file
     */
    private String extractTextFromPDF(InputStream inputStream) throws IOException {
        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String extractedText = pdfStripper.getText(document);

            logger.info("Extracted {} characters from PDF", extractedText.length());
            return cleanAndValidateText(extractedText);
        } catch (IOException e) {
            logger.error("Error extracting text from PDF: {}", e.getMessage());
            throw new IOException("Failed to extract text from PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Extract text from PPTX file
     */
    private String extractTextFromPPTX(InputStream inputStream) throws IOException {
        try (OPCPackage opcPackage = OPCPackage.open(inputStream);
                XMLSlideShow pptx = new XMLSlideShow(opcPackage)) {

            StringJoiner textJoiner = new StringJoiner("\n\n");

            for (XSLFSlide slide : pptx.getSlides()) {
                StringJoiner slideText = new StringJoiner("\n");

                for (XSLFShape shape : slide.getShapes()) {
                    if (shape instanceof XSLFTextShape) {
                        XSLFTextShape textShape = (XSLFTextShape) shape;
                        String shapeText = textShape.getText();
                        if (shapeText != null && !shapeText.trim().isEmpty()) {
                            slideText.add(shapeText.trim());
                        }
                    }
                }

                String slideContent = slideText.toString();
                if (!slideContent.isEmpty()) {
                    textJoiner.add("Slide:\n" + slideContent);
                }
            }

            String extractedText = textJoiner.toString();
            logger.info("Extracted {} characters from PPTX ({} slides)",
                    extractedText.length(), pptx.getSlides().size());

            return cleanAndValidateText(extractedText);
        } catch (Exception e) {
            logger.error("Error extracting text from PPTX: {}", e.getMessage());
            throw new IOException("Failed to extract text from PPTX: " + e.getMessage(), e);
        }
    }

    /**
     * Clean and validate extracted text
     */
    private String cleanAndValidateText(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("No readable text found in the document");
        }

        // Clean up the text
        String cleanedText = text
                .replaceAll("\\s+", " ") // Replace multiple whitespaces with single space
                .replaceAll("\\n\\s*\\n", "\n\n") // Clean up multiple newlines
                .trim();

        // Validate minimum content length
        if (cleanedText.length() < 50) {
            throw new IllegalArgumentException("Document contains insufficient text content for quiz generation");
        }

        // Limit text length to avoid API limits (keeping first 8000 characters for
        // context)
        if (cleanedText.length() > 8000) {
            cleanedText = cleanedText.substring(0, 8000) + "...";
            logger.info("Text truncated to 8000 characters for AI processing");
        }

        return cleanedText;
    }
}
