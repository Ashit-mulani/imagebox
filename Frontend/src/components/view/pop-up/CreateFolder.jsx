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
      <DialogContent
        showCloseButton={false}
        className="rounded-4xl border-0 dark:bg-[#1a1a1a] bg-slate-100 gap-8"
      >
        <DialogHeader className="gap-6">
          <DialogTitle className="text-2xl font-normal">
            Create New Folder
          </DialogTitle>
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
              <div className="flex items-end justify-end">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="p-5 text-blue-600 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-300 rounded-full dark:text-blue-300"
                    onClick={() => setCreateFolder(false)}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  disabled={folderLoading}
                  variant="ghost"
                  className="p-5 text-blue-600 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-300 rounded-full dark:text-blue-300"
                >
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
