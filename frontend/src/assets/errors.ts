const errors = {
  validation: {
    uploadForm: {
      inputTextRequired: "Input text is required!",
      textFileRequired: "File selection is required!",
      textFileInvalid: "Invalid file type! Please select a Plain Text File.",
    },
    downloadForm: {
      uniqueIdRequired: "Unique ID is required!",
      invalidUniqueId: "Invalid Unique ID! Please enter a valid Unique ID.",
    },
  },
  process: {
    download: {
      nonExistentUniqueId:
        "The Unique ID does not exist! Please enter a valid Unique ID.",
      pdfNotReady: "The PDF is not ready yet! Please try again later.",
      downloadFailure: "Failed to download PDF! Please try again later.",
    },
    upload: {
      uploadFailure: "Failed to upload file! Please try again later.",
    },
  },
};

export default errors;
