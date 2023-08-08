# poc-azure-blob-media-optimization
Proof of Concept - Azure Blob media content optimization

## About

This project is a proof of concept to demonstrate how to optimize media content stored in Azure Blob Storage.

There are several workflows available:
- download: will download the files from the source container to a local folder using parallel requests and avoiding big files like videos. This criteria can be changed in the config file. This workflow will also create a `metadata.json` file that can be used to explorer the blob files
- resize: will alert you from using huge images based on a threshold that can be modified in the config file.
- optimize: will optimize the files in a subfolder. It will print a report with the comparison between the original and the optimized files.
- upload: will upload the optimized files to a destination container. It will overwrite the previous files.

## How to use

1. Clone this repository
2. Create a `.env` file and include the following variables:
```
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account-name
AZURE_STORAGE_CONTAINER_NAME=yout-storage-container-name
AZURE_STORAGE_SAS_TOKEN=yout-storage-sas-token
```
3. Use the correct version of Node.js (check the `.nvmrc` file) `nvm use`
4. Install the dependencies `npm install`
5. Run the workflows in order:
```bash
npm run wf:download
npm run wf:resize
npm run wf:optimize
npm run wf:upload
```