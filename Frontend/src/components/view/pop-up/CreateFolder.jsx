import { setFolderError } from "@/app/slice/folder-slice";
import { Button } from "@/components/ui/button";
import CInput from "@/components/ui/CInput";
import CLoader from "@/components/ui/CLoader";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useUpload from "@/context/UploadContext";
import useFolderApi from "@/hooks/api-hooks/FolderApi";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CreateFolder = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { createFolder, setCreateFolder } = useUpload();

  const { folderLoading, folderError } = useSelector((state) => state.folder);

  const { addFolder } = useFolderApi();

  const handleCreateFolder = async (data) => {
    const success = await addFolder(data);
    if (success) {
      dispatch(setFolderError(null));
      setCreateFolder(false);
      reset();
      navigate(`/user/folder/${success}`);
    }
  };

  return (
    <Dialog
      open={createFolder}
      onOpenChange={(open) => {
        setCreateFolder(open);
        if (!open) {
          dispatch(setFolderError(null));
          reset();
        }
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader className="gap-6">
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400 ">
            Create a new folder to organize and manage your images efficiently.
            Keep your workspace clean and easily access files whenever you need
            them.
          </DialogDescription>
        </DialogHeader>
        <div>
          <form
            onSubmit={handleSubmit(handleCreateFolder)}
            className="flex flex-col gap-8"
          >
            <div>
              <CInput
                className="py-5 px-4"
                label="Folder"
                id="folder"
                placeholder="Folder name here . . . ."
                type="text"
                {...register("name", {
                  required: "Folder name is required !",
                  maxLength: {
                    value: 30,
                    message: "Folder name must be at most 30 characters",
                  },
                  validate: (value) =>
                    value.trim() !== "" || "Folder name cannot be empty spaces",
                })}
              />
              {errors.name && (
                <span className="text-red-500 text-xs m-1">
                  {errors.name.message}
                </span>
              )}
              {folderError && (
                <span className="text-red-500 text-xs m-1">{folderError}</span>
              )}
            </div>
            <DialogFooter>
              <div className="flex items-end justify-end gap-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateFolder(false)}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button disabled={folderLoading}>
                  {folderLoading && <CLoader />}Create
                </Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolder;
