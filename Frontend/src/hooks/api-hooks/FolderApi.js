import axios from "axios";
import {
  setFolder,
  setFolderError,
  setFolderFetched,
  setFolderLoading,
  setInitialFolderLoading,
} from "@/app/slice/folder-slice";
import { useDispatch, useSelector } from "react-redux";
import { backendUrl } from "@/const/const";
import { toast } from "sonner";
import { setUser } from "@/app/slice/user-slice";
import { setTrashFolder } from "@/app/slice/trash-slice";

export default function useFolderApi() {
  const dispatch = useDispatch();

  const { folder, folderFetched } = useSelector((state) => state.folder);

  const { user } = useSelector((state) => state.user);

  const { trashFolder } = useSelector((state) => state.trash);

  const getFolder = async () => {
    if (folderFetched && folder?.length > 0) return;
    dispatch(setInitialFolderLoading(true));
    try {
      const res = await axios.get(`${backendUrl}/get/folders`, {
        withCredentials: true,
      });
      const folder = res?.data?.data;
      if (folder) {
        dispatch(setFolder(folder));
        dispatch(setFolderFetched(true));
      }
      return true;
    } catch (error) {
      toast.error("Failed to get folders");
      dispatch(
        setFolderError(error.response?.data?.message || "Failed to get folders")
      );
    } finally {
      dispatch(setInitialFolderLoading(false));
    }
  };

  const addFolder = async (data) => {
    dispatch(setFolderLoading(true));
    try {
      const res = await axios.post(`${backendUrl}/folder/create`, data, {
        withCredentials: true,
      });
      const createdFolder = res?.data?.data;
      if (createdFolder) {
        if (folder) {
          dispatch(setFolder([...folder, createdFolder]));
        } else {
          dispatch(setFolder([createdFolder]));
        }
      }
      return createdFolder?._id;
    } catch (error) {
      toast.error("Failed to add folder");
      dispatch(
        setFolderError(
          error.response?.data?.message || "Failed to create folder"
        )
      );
    } finally {
      dispatch(setFolderLoading(false));
    }
  };

  const updateFolder = async (data, folderId) => {
    const oldFolder = folder;
    const updatedFolders = folder.map((f) =>
      f._id === folderId ? { ...f, name: data.name } : f
    );
    dispatch(setFolder(updatedFolders));
    dispatch(setFolderLoading(true));
    try {
      await axios.put(`${backendUrl}/folder/update/${folderId}`, data, {
        withCredentials: true,
      });
      return true;
    } catch (error) {
      dispatch(setFolder(oldFolder));
      toast.error("Failed to update folder");
      dispatch(
        setFolderError(
          error.response?.data?.message || "Failed to update folder"
        )
      );
    } finally {
      dispatch(setFolderLoading(false));
    }
  };

  const moveToTrashFolder = async (Dfolder) => {
    const isCurrentlyTrashed = trashFolder.some((f) => f._id === Dfolder._id);
    const oldFolder = folder;
    const oldTrashFolder = trashFolder;
    let updatedFolders, updatedTrashFolders;
    if (isCurrentlyTrashed) {
      updatedTrashFolders = trashFolder.filter((f) => f._id !== Dfolder._id);
      updatedFolders = [...folder, Dfolder];
    } else {
      updatedFolders = folder.filter((f) => f._id !== Dfolder._id);
      updatedTrashFolders = [...trashFolder, Dfolder];
    }

    dispatch(setFolder(updatedFolders));
    dispatch(setTrashFolder(updatedTrashFolders));
    dispatch(setFolderLoading(true));

    try {
      const res = await axios.delete(
        `${backendUrl}/folder/delete/${Dfolder._id}`,
        {
          withCredentials: true,
        }
      );
      dispatch(
        setUser({ ...user, metadata: res?.data?.data?.updatedUserMetadata })
      );
      return true;
    } catch (error) {
      dispatch(setFolder(oldFolder));
      dispatch(setTrashFolder(oldTrashFolder));
      toast.error(
        isCurrentlyTrashed
          ? "Failed to restore folder"
          : "Failed to delete folder"
      );
      dispatch(
        setFolderError(
          error.response?.data?.message ||
            (isCurrentlyTrashed
              ? "Failed to restore folder"
              : "Failed to delete folder")
        )
      );
    } finally {
      dispatch(setFolderLoading(false));
    }
  };

  return {
    getFolder,
    addFolder,
    updateFolder,
    moveToTrashFolder,
  };
}
