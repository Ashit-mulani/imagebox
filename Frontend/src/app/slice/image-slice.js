import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  image: {},
  imageLoading: {},
  imageError: {},
  imageUploadLoading: {},
  imageUploadError: null,
  imageUploading: null,
};

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    setImage: (state, action) => {
      if (!action.payload) return;
      const { folderId, images, fetched = true } = action.payload;
      if (!folderId) return;
      state.image[folderId] = { data: images, fetched };
    },
    appendImage: (state, action) => {
      const { folderId, images } = action.payload;
      if (!state.image[folderId]) {
        state.image[folderId] = { data: [], fetched: true };
      }
      state.image[folderId].data = [
        ...images,
        ...(state.image[folderId].data || []),
      ];
    },
    setImageLoading: (state, action) => {
      const { folderId, loading } = action.payload;
      state.imageLoading[folderId] = loading;
    },
    setImageError: (state, action) => {
      const { folderId, error } = action.payload;
      state.imageError[folderId] = error;
    },
    setImageUploadLoading: (state, action) => {
      const { folderId, loading } = action.payload;
      state.imageUploadLoading[folderId] = loading;
    },
    setImageUploadError: (state, action) => {
      state.imageUploadError = action.payload;
    },
    setImageUploading: (state, action) => {
      state.imageUploading = action.payload;
    },
  },
});

export const {
  setImage,
  appendImage,
  setImageError,
  setImageLoading,
  setImageUploadError,
  setImageUploadLoading,
  setImageUploading,
} = imageSlice.actions;

export default imageSlice.reducer;
