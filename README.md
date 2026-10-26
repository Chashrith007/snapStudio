# SnapStudio

A photo booth with two implementations: a **browser edition** for static hosting on Vercel and the original **Python/Gradio edition** for local demonstrations.

## Browser edition — ready to deploy

The `web/` folder contains the browser app. Photos are processed on the visitor's device with MediaPipe and Canvas. It supports webcam snapshots, photo uploads, accessories, filters, frames, captions, and PNG downloads.

- **Try locally:** double-click `Start Browser Studio.cmd`.
- **Vercel:** import this repository, select **Other**, and set the **Root Directory to `web`**. No build command is needed.
- **Setup, privacy, limitations, and validation:** [Browser README](web/README.md).

The web edition is prepared for deployment; a live deployment link has not yet been created.

---

# SnapStudio - SHPE demo

Double-click **Start SnapStudio.cmd**. Keep its window open. The browser opens at http://127.0.0.1:7860. If it does not open automatically, enter that address in Chrome or Edge.

This installation is for this laptop. Keep the folder in its current location, including .venv. No Internet is required for photo processing after installation.

## One-minute demo

1. Click Try the sample portrait, select Sunglasses and Vintage, then Create my photo.
2. Switch to a webcam snapshot. Allow camera access in the browser, face the camera in good light, and take a snapshot.
3. Try a different accessory and caption. Leave space above your head for hats.
4. Download the PNG using the arrow icon on the result.
5. Click Next guest / clear photos between people.

## What to say

SnapStudio is a computer-vision photo booth. OpenCV finds face regions. The app positions accessories using their size and location, then Pillow applies filters and a frame. Gradio provides the interface. The app runs on your laptop locally, or on a Hugging Face server when hosted. It does not identify people.

## Before October 28

Test the webcam, then disconnect Wi-Fi and test again. Keep assets/demo-result.png as a finished-photo backup. Bring your charger.

## Limitations and troubleshooting

This version processes snapshots, not continuous video. Accessories use approximate face rectangles rather than eye landmarks. Face the camera in good light and use Fine-tune the fit if needed. Hats may clip when there is little space above the head.

If the camera is busy, close video-call apps. Check browser camera permissions, or use the sample/upload fallback.

If port 7860 is busy, close the earlier app window before launching again. Close the launch window to stop the server after your demo.

Next guest clears the visible photos. Temporary uploads and results may remain in the cache folder on the computer or server running the app. Clearing the displayed photos does not delete those cached files. For a local session, close the app before deleting its cache folder.

## Sample credit

NASA public-domain portrait of astronaut Eileen Collins, distributed by scikit-image. Source: https://github.com/scikit-image/scikit-image/blob/v0.19.3/skimage/data/astronaut.png . No endorsement implied.

## Run a fresh copy locally

Use Python 3.12. In the project folder on Windows, run:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

## Deploy to Hugging Face Spaces

Create a Gradio Space, then upload `app.py`, `effects.py`, `requirements.txt`, this `README.md`, and the `assets/` folder. Keep assets inside their folder. Exclude `.venv/`, `cache/`, and `__pycache__/`.

The README metadata selects Python 3.12 and Gradio 6.30.0. The app detects Spaces through `SPACE_ID`, listens on port 7860, and does not open a desktop browser on the server. When run locally, it listens only on localhost and opens your browser.

The hosted version sends uploaded images and webcam snapshots to the Hugging Face server for processing. A local installation processes them on your computer. This is face detection, not identity recognition.

Deployment is ready to test once the Space finishes building; a successful local test does not confirm a successful hosted build.
