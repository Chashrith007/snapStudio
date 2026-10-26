from PIL import Image, ImageDraw, ImageEnhance, ImageOps, ImageFont
import numpy as np

def detect_faces(image):
    import cv2
    cv2.setNumThreads(1)
    cv2.setUseOptimized(False)
    detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    if detector.empty():
        raise RuntimeError("Face detector could not load. Run the installation cell again.")
    gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
    return detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))

def make_photo(photo, accessory="Sunglasses", effect="Original", frame="Polaroid", caption="Good times!", size=1.0, vertical=0):
    if photo is None:
        return None, "Upload a photo or take a webcam snapshot first."
    img = ImageOps.exif_transpose(photo).convert("RGB")
    img.thumbnail((1600, 1600))
    faces = detect_faces(img)
    if effect == "Black & white":
        img = ImageOps.grayscale(img).convert("RGB")
    elif effect == "Vintage":
        img = ImageOps.colorize(ImageOps.grayscale(img), "#35233b", "#ffe2ac")
    elif effect == "Warm":
        img = ImageEnhance.Color(img).enhance(1.25)
        img = Image.blend(img, Image.new("RGB", img.size, "#ffb45e"), 0.12)
    draw = ImageDraw.Draw(img)
    for x, y, w, h in faces:
        x, y, w, h = map(int, (x, y, w, h))
        cx = x + w / 2
        y += h * vertical / 100
        sw = w * size
        pen = max(2, int(w * 0.025))
        if accessory in ("Sunglasses", "Glasses + Party hat"):
            ey = y + h * 0.40
            for side in (-1, 1):
                ex = cx + side * sw * 0.23
                box = (ex-sw*.20, ey-sw*.10, ex+sw*.20, ey+sw*.13)
                draw.rounded_rectangle(box, radius=max(2, int(sw*.06)), fill="#172039", outline="#f8cf56", width=pen)
                draw.line((ex-sw*.12, ey-sw*.04, ex+sw*.03, ey-sw*.04), fill="#9dd6ea", width=pen)
            draw.line((cx-sw*.04, ey, cx+sw*.04, ey), fill="#f8cf56", width=pen)
        if accessory in ("Party hat", "Glasses + Party hat"):
            bottom = y + h * .08
            top = max(2, bottom-sw*.65)
            draw.polygon([(cx-sw*.39,bottom),(cx,top),(cx+sw*.39,bottom)], fill="#ab66ed", outline="#ffe374", width=pen)
            for t in (.35,.6,.8):
                yy = top + (bottom-top)*t
                draw.ellipse((cx-sw*.04,yy-sw*.04,cx+sw*.04,yy+sw*.04), fill="#ffe374")
        if accessory == "Cat ears":
            for side in (-1,1):
                ex = cx + side*sw*.32
                base = y+h*.12
                draw.polygon([(ex-sw*.16,base),(ex, max(0,base-sw*.35)),(ex+sw*.16,base)], fill="#242539", outline="#f39fcb", width=pen*2)
    if frame != "None":
        border = max(12, img.width // 30)
        footer = max(65, img.width // 9)
        color = "#fffaf0" if frame == "Polaroid" else "#231a3a"
        img = ImageOps.expand(img, (border,border,border,footer), fill=color)
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", max(16, img.width//32))
        except OSError:
            font = ImageFont.load_default()
        text = (caption or "")[:70]
        while text and draw.textbbox((0,0),text,font=font)[2] > img.width-border*2:
            text = text[:-1]
        draw.text((img.width//2,img.height-footer//2),text,font=font,anchor="mm",fill="#302442" if frame=="Polaroid" else "#ffe374")
    count = len(faces)
    status = f"{count} face(s) detected. Your photo is ready to download."
    if count == 0:
        status = "No faces found. Filter and frame applied. Try a brighter, front-facing photo for accessories."
    return img, status

