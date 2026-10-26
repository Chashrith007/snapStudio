import os
from pathlib import Path
ROOT=Path(__file__).parent
os.environ['GRADIO_ANALYTICS_ENABLED']='False'
os.environ['HF_HUB_OFFLINE']='1'
os.environ['GRADIO_TEMP_DIR']=str(ROOT/'cache')
import gradio as gr
from PIL import Image
from effects import make_photo
CSS='''
.gradio-container {max-width:1240px !important; margin:auto !important;}
.hero {padding:32px; border:1px solid #514278; border-radius:22px; background:linear-gradient(115deg,#241e48,#131a30); margin-bottom:18px;}
.eyebrow {color:#b7a3ff;font:700 12px sans-serif;letter-spacing:3px;}
.hero h1 {font:800 54px sans-serif;letter-spacing:-2px;color:#fff;margin:12px 0 8px;}
.hero p {color:#c5c9df;font-size:17px;line-height:1.6;}
.pill {display:inline-block;color:#a3f0cf;border:1px solid #36665e;border-radius:30px;padding:7px 12px;font-size:12px;}
#create {background:linear-gradient(100deg,#8855ed,#bf5ac7) !important;color:white !important;border:0 !important;font-size:17px;min-height:52px;}
'''
def sample():
    return Image.open(ROOT/'assets'/'sample.png').convert('RGB')
def render(*args):
    try:
        return make_photo(*args)
    except Exception as exc:
        print(f'Processing failed: {exc}')
        raise gr.Error('Could not process this photo. Try a JPG or PNG.') from exc
with gr.Blocks(title='SnapStudio | Smart Photo Booth') as app:
    gr.HTML('<div class="hero"><div class="eyebrow">COMPUTER VISION / CREATIVE PLAY</div><h1>SnapStudio.</h1><p>A little personality. A photo worth keeping.</p><span class="pill">Runs locally on this laptop</span></div>')
    with gr.Row():
        with gr.Column():
            gr.Markdown('### 01 / Start with a photo')
            photo=gr.Image(sources=['webcam','upload'],type='pil',label='Webcam snapshot or photo upload',height=300)
            demo=gr.Button('Try the sample portrait',size='sm')
            gr.Markdown('### 02 / Find your look')
            accessory=gr.Dropdown(['None','Sunglasses','Party hat','Glasses + Party hat','Cat ears'],value='Sunglasses',label='Accessories')
            effect=gr.Radio(['Original','Warm','Black & white','Vintage'],value='Original',label='Color mood')
            frame=gr.Radio(['None','Polaroid','Midnight'],value='Polaroid',label='Photo frame')
            caption=gr.Textbox(value='Make it memorable.',label='Frame caption',max_lines=1)
            with gr.Accordion('Fine-tune the fit',open=False):
                size=gr.Slider(.7,1.4,value=1,step=.05,label='Accessory size')
                vertical=gr.Slider(-25,25,value=0,step=1,label='Vertical placement')
            create=gr.Button('Create my photo',variant='primary',elem_id='create')
        with gr.Column():
            gr.Markdown('### 03 / Your main-character moment')
            result=gr.Image(type='pil',format='png',interactive=False,label='Finished photo / download with the arrow icon',height=550,buttons=['download','fullscreen'])
            status=gr.Textbox(value='Ready when you are. Take a snapshot or try the sample.',label='Studio status',interactive=False)
            gr.Markdown('**Best shot:** face the camera in good light. Leave space above your head for hats.')
            clear=gr.Button('Next guest / clear photos',size='sm')
    with gr.Accordion('How it works',open=False):
        gr.Markdown('**Photo → face detection → accessories → filter → frame → PNG.** OpenCV detects faces, Pillow draws graphics, and Gradio provides the interface. Snapshot-based; no identity recognition. Front-facing photos work best.')
    gr.Markdown('SNAPSTUDIO / SHPE DEMO / OCTOBER 28, 2026')
    demo.click(sample,outputs=photo)
    create.click(render,[photo,accessory,effect,frame,caption,size,vertical],[result,status],concurrency_limit=1,api_name='create_photo')
    clear.click(lambda:(None,None,'Ready for the next guest.'),outputs=[photo,result,status])
if __name__=='__main__':
    app.launch(server_name='127.0.0.1',server_port=7860,share=False,inbrowser=True,theme=gr.themes.Base(primary_hue='violet',neutral_hue='slate',font=['Segoe UI','Arial','sans-serif']),css=CSS)
