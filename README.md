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

SnapStudio is a computer-vision photo booth. OpenCV finds face regions. The app positions accessories using their size and location, then Pillow applies filters and a frame. Gradio provides the interface. The app runs on this laptop and does not identify people.

## Before October 28

Test the webcam, then disconnect Wi-Fi and test again. Keep assets/demo-result.png as a finished-photo backup. Bring your charger.

## Limitations and troubleshooting

This version processes snapshots, not continuous video. Accessories use approximate face rectangles rather than eye landmarks. Face the camera in good light and use Fine-tune the fit if needed. Hats may clip when there is little space above the head.

If the camera is busy, close video-call apps. Check browser camera permissions, or use the sample/upload fallback.

If port 7860 is busy, close the earlier app window before launching again. Close the launch window to stop the server after your demo.

Next guest clears the visible photos. Temporary uploads and results may remain in the cache folder. After closing the app, you can delete cache to remove those temporary files.

## Sample credit

NASA public-domain portrait of astronaut Eileen Collins, distributed by scikit-image. Source: https://github.com/scikit-image/scikit-image/blob/v0.19.3/skimage/data/astronaut.png . No endorsement implied.
