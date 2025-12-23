import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BiSolidFolder } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import useUpload from "@/context/UploadContext";
import { IoMdImage } from "react-icons/io";

const Search = ({ open, setOpen }) => {
  const navigate = useNavigate();

  const { setPreviewImage } = useUpload();

  const { folder } = useSelector((state) => state.folder);

  const { image } = useSelector((state) => state.image);

  const allImages = Object.entries(image).flatMap(([folderId, folderData]) =>
    folderData.data.map((img) => ({ ...img, folderId }))
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 max-w-lg w-full shadow-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Command className="dark:bg-[#212121] border-2">
          <CommandInput
            className=""
            placeholder="Search folders, images, etc..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Folders">
              {folder?.map((f) => (
                <CommandItem
                  onSelect={() => (
                    setOpen(false), navigate(`/user/folder/${f?._id}`)
                  )}
                  className="cursor-pointer flex items-center gap-2"
                  key={f._id}
                >
                  <BiSolidFolder className="text-yellow-500 w-5 h-5" />
                  <span>{f.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Images">
              {allImages.map((img) => (
                <CommandItem
                  onSelect={() => (
                    setOpen(false),
                    navigate(`/user/folder/${img?.folderId}`),
                    setPreviewImage(img)
                  )}
                  key={img._id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Avatar className="size-6">
                    <AvatarImage
                      className="h-full w-full object-cover"
                      src={img.url || img.src}
                    />
                    <AvatarFallback className="bg-zinc-800 text-white">
                      <IoMdImage className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[200px]">{img.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default Search;
