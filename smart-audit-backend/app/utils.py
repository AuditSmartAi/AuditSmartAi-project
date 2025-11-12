import os

async def save_uploaded_file(upload_file, folder: str) -> str:
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, upload_file.filename)
    with open(file_path, "wb") as f:
        f.write(await upload_file.read())
    return file_path
