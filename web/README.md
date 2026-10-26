# SnapStudio — Browser edition

A photo booth that runs face detection and image editing in the visitor's browser. Built with HTML, CSS, JavaScript, Canvas, and MediaPipe Tasks Vision 0.10.14. The original Python/Gradio app remains in the parent folder.

## Features

- Webcam snapshots with an optional three-second countdown; mirrored preview and capture.
- JPG, PNG, and WebP uploads, plus a bundled sample portrait.
- Face detection and eye keypoints for positioning and rotating accessories.
- Shades, party hats, cat ears, and a combined look.
- Four color moods, two frames, captions, and placement controls.
- Original-photo comparison and PNG export.
- Responsive layout with keyboard-accessible controls and status messages.

## Run locally

From the repository folder:

```powershell
.\.venv\Scripts\python.exe -m http.server 8080 --bind 127.0.0.1 --directory web
```

Open http://127.0.0.1:8080 in Chrome or Edge. You can also double-click **Start Browser Studio.cmd** in the repository folder after setting up the Python environment.

The browser version itself needs no Python packages or build step. Python is only used as a convenient local static file server. Another static server also works. Do not open index.html directly as a file: the detection model needs HTTP(S).

## Deploy on Vercel

1. Commit and push the `web/` folder to GitHub, including its vendor and model files.
2. Sign in to Vercel and select **Add New → Project**.
3. Import `Chashrith007/snapStudio`.
4. Set **Root Directory** to `web`.
5. Set **Framework Preset** to **Other**.
6. Leave the Build Command empty. Use `.` as the Output Directory if requested. No install step is required.
7. Deploy and open the resulting HTTPS URL.
8. Test the sample, camera, upload, and PNG download on the deployed site before sharing it.

The included `vercel.json` configures static hosting. There are no API keys, server functions, or environment variables. Vercel's browser login and repository access are configured through your own account.

## Privacy and behavior

Uploaded photos and camera frames are processed on the device using Canvas and MediaPipe. Application code does not send them to a server or write them to browser storage. Downloads save only when requested. Start fresh clears the active photo; closing the camera stops its tracks. Website and model assets are requested from the host, which may log ordinary page requests.

Camera permission is requested only after clicking Open camera. Camera access needs HTTPS or localhost. The source and preview are capped at a longest edge of 1200 pixels; frames can increase the exported dimensions.

All model and runtime files are included in this folder. The app needs access to the site for its initial load; it is not an installable offline app. Once loaded, processing does not call an inference server.

## Limitations

This is a snapshot booth, not continuous face tracking. Detection works best with well-lit frontal faces. Extreme head angles, occlusion, and small faces may be missed. Hats can clip at the edge. Eye keypoints improve glasses alignment but do not provide full face-mesh tracking. If the detector cannot load, filters and frames still work. Phones and slower devices may take longer to initialize the detector.

## Validation

Verified locally in the browser: bundled model initialization, detection on the sample portrait, accessory and frame selection, caption changes, filter selection, original comparison, PNG download initiation, and reset/disabled states. Physical webcam capture and Vercel deployment still require testing on the user's device/account. These checks are not an accuracy benchmark across people or lighting conditions.

## Credits

- MediaPipe Tasks Vision 0.10.14 and BlazeFace short-range model: Google / Google AI Edge. See `THIRD_PARTY_NOTICES.md` and `vendor/LICENSE`.
- Sample portrait: NASA public-domain photograph of astronaut Eileen Collins, distributed by scikit-image. No endorsement implied.
