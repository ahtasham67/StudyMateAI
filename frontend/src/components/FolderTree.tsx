import {
  CreateNewFolder,
  Delete,
  Edit,
  ExpandLess,
  ExpandMore,
  Folder,
  FolderOpen,
  InsertDriveFile,
  MoreVert,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { folderAPI } from "../services/api";

interface StudyFolder {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  subFolders: StudyFolder[];
  materialCount: number;
  createdAt: string;
  updatedAt: string;
}

interface FolderTreeProps {
  onFolderSelect: (folderId: number | null) => void;
  selectedFolderId: number | null;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  onFolderSelect,
  selectedFolderId,
}) => {
  const [folders, setFolders] = useState<StudyFolder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<StudyFolder | null>(
    null
  );
  const [parentFolderId, setParentFolderId] = useState<number | null>(null);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFolder, setMenuFolder] = useState<StudyFolder | null>(null);

  // Form state
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");

  useEffect(() => {
    loadRootFolders();
  }, []);

  const loadRootFolders = async () => {
    try {
      setLoading(true);
      const response = await folderAPI.getRootFolders();
      const foldersData = response.data || [];

      // Ensure each folder has a subFolders array
      const normalizedFolders = foldersData.map((folder: StudyFolder) => ({
        ...folder,
        subFolders: folder.subFolders || [],
        materialCount: folder.materialCount || 0,
      }));

      setFolders(normalizedFolders);
    } catch (err: any) {
      console.error("Error loading folders:", err);
      setFolders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateFolderInTree = (
    folderList: StudyFolder[],
    targetId: number,
    newSubFolders: StudyFolder[]
  ): StudyFolder[] => {
    if (!folderList || !Array.isArray(folderList)) {
      return [];
    }

    return folderList.map((folder) => {
      if (!folder) return folder;

      if (folder.id === targetId) {
        return {
          ...folder,
          subFolders: newSubFolders || [],
        };
      }

      if (
        folder.subFolders &&
        Array.isArray(folder.subFolders) &&
        folder.subFolders.length > 0
      ) {
        return {
          ...folder,
          subFolders: updateFolderInTree(
            folder.subFolders,
            targetId,
            newSubFolders
          ),
        };
      }

      return folder;
    });
  };

  const loadFolderContents = async (folderId: number) => {
    try {
      const response = await folderAPI.getFolderWithContents(folderId);
      const folderContents = response.data || {};

      // Normalize the returned folder data
      if (folderContents.folder) {
        folderContents.folder.subFolders =
          folderContents.folder.subFolders || [];
        folderContents.folder.materialCount =
          folderContents.folder.materialCount || 0;
      }

      const updatedFolders = updateFolderInTree(
        folders,
        folderId,
        folderContents.folder?.subFolders || []
      );
      setFolders(updatedFolders);

      onFolderSelect(folderId);
    } catch (err: any) {
      console.error("Error loading folder contents:", err);
    }
  };

  const handleFolderToggle = async (folderId: number) => {
    const newExpanded = new Set(expandedFolders);

    if (expandedFolders.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
      // Load folder contents if not already loaded
      await loadFolderContents(folderId);
    }

    setExpandedFolders(newExpanded);
  };

  const handleFolderSelect = (folderId: number | null) => {
    onFolderSelect(folderId);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    folder: StudyFolder
  ) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuFolder(folder);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuFolder(null);
  };

  const handleCreateFolder = () => {
    setParentFolderId(menuFolder?.id || null);
    setFolderName("");
    setFolderDescription("");
    setCreateDialogOpen(true);
    handleMenuClose();
  };

  const handleEditFolder = () => {
    if (menuFolder) {
      setSelectedFolder(menuFolder);
      setFolderName(menuFolder.name);
      setFolderDescription(menuFolder.description || "");
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteFolder = () => {
    setSelectedFolder(menuFolder);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const submitCreateFolder = async () => {
    try {
      await folderAPI.createFolder({
        name: folderName,
        description: folderDescription,
        parentId: parentFolderId,
      });

      // Refresh the folder tree
      await loadRootFolders();
      setCreateDialogOpen(false);
    } catch (err: any) {
      console.error("Error creating folder:", err);
    }
  };

  const submitEditFolder = async () => {
    if (!selectedFolder) return;

    try {
      await folderAPI.updateFolder(selectedFolder.id, {
        name: folderName,
        description: folderDescription,
      });

      // Refresh the folder tree
      await loadRootFolders();
      setEditDialogOpen(false);
    } catch (err: any) {
      console.error("Error updating folder:", err);
    }
  };

  const submitDeleteFolder = async () => {
    if (!selectedFolder) return;

    try {
      await folderAPI.deleteFolder(selectedFolder.id);

      // Refresh the folder tree
      await loadRootFolders();
      setDeleteDialogOpen(false);
    } catch (err: any) {
      console.error("Error deleting folder:", err);
    }
  };

  const renderFolder = (folder: StudyFolder, level: number = 0) => {
    if (!folder) return null;

    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const subFolders = folder.subFolders || [];

    return (
      <React.Fragment key={folder.id}>
        <ListItem
          disablePadding
          sx={{
            pl: level * 2,
            backgroundColor: isSelected ? "action.selected" : "transparent",
          }}
        >
          <ListItemButton
            onClick={() => handleFolderSelect(folder.id)}
            sx={{ py: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFolderToggle(folder.id);
                }}
                disabled={subFolders.length === 0}
              >
                {subFolders.length > 0 ? (
                  isExpanded ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )
                ) : null}
              </IconButton>
            </ListItemIcon>
            <ListItemIcon sx={{ minWidth: 36 }}>
              {isExpanded ? (
                <FolderOpen color="primary" />
              ) : (
                <Folder color="primary" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2">{folder.name}</Typography>
                  {folder.materialCount > 0 && (
                    <Chip
                      label={folder.materialCount}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.75rem" }}
                    />
                  )}
                </Box>
              }
              secondary={folder.description}
            />
            <IconButton size="small" onClick={(e) => handleMenuOpen(e, folder)}>
              <MoreVert />
            </IconButton>
          </ListItemButton>
        </ListItem>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {subFolders.map((subFolder) => renderFolder(subFolder, level + 1))}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <Typography>Loading folders...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6">Folders</Typography>
        <Button
          startIcon={<CreateNewFolder />}
          onClick={() => {
            setParentFolderId(null);
            setFolderName("");
            setFolderDescription("");
            setCreateDialogOpen(true);
          }}
          size="small"
        >
          New Folder
        </Button>
      </Box>

      {/* Root folder option */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleFolderSelect(null)}
            sx={{
              backgroundColor:
                selectedFolderId === null ? "action.selected" : "transparent",
            }}
          >
            <ListItemIcon>
              <InsertDriveFile />
            </ListItemIcon>
            <ListItemText primary="All Files" />
          </ListItemButton>
        </ListItem>

        {folders &&
          folders.length > 0 &&
          folders.map((folder) => renderFolder(folder))}
      </List>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleCreateFolder}>
          <CreateNewFolder sx={{ mr: 1 }} />
          New Subfolder
        </MenuItem>
        <MenuItem onClick={handleEditFolder}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteFolder} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Folder Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={folderDescription}
            onChange={(e) => setFolderDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={submitCreateFolder}
            variant="contained"
            disabled={!folderName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={folderDescription}
            onChange={(e) => setFolderDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={submitEditFolder}
            variant="contained"
            disabled={!folderName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedFolder?.name}"? This will
            also delete all subfolders and files inside it. This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={submitDeleteFolder}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FolderTree;
