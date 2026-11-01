"""Build original 2:3 editorial cards and their RSS entries. No external imagery."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, textwrap, html, re
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'assets/social/2026-11'; OUT.mkdir(parents=True,exist_ok=True)
DATA=[
('ecoflow','EcoFlow','Strom unterwegs.\nWas brauchst du\nwirklich?', [('Kapazität','Wie lange sollen deine Geräte laufen?'),('Leistung','Welche Geräte laufen gleichzeitig?'),('Ladealltag','Gewicht und Lademöglichkeiten mitplanen.')]),
('meaco','Meaco','Luftentfeuchter:\n3 Fragen vor\ndem Kauf.', [('Raum','Größe und Temperatur berücksichtigen.'),('Alltag','Aufstellort und Geräusch einplanen.'),('Kosten','Leistung und laufende Kosten prüfen.')]),
('torro','TORRO','Neue Hülle?\nErst das genaue\nModell prüfen.', [('Gerät','Modell und Generation genau abgleichen.'),('Laden','Hülle und Ladezubehör zusammen prüfen.'),('Nutzung','Kartenfächer, Standfunktion und Material.')]),
('canvasi','Canvasi','Vom Bild zur\npassenden\nRahmenwahl.', [('Format','Das tatsächliche Bildmaß nehmen.'),('Tiefe','Rahmenprofil und Bildtiefe abgleichen.'),('Projekt','Maltechnik und Untergrund mitdenken.')]),
('persen','PERSEN smart Creator','Digitale Hilfe\nfür deinen\nUnterricht?', [('Funktion','Passt das Werkzeug zu deiner Aufgabe?'),('Material','Ausgangsmaterial und Anpassung prüfen.'),('Nutzung','Preis und Nutzungsrechte abgleichen.')]),
('cronjager','Cronjager','Bewusster\nshoppen.\nKlarer wählen.', [('Bedarf','Erst Einsatz und passende Variante klären.'),('Preis','Lieferung und Zubehör mitrechnen.'),('Bestellung','Rückgabe und Lieferbedingungen lesen.')]),
('porzellantreff','Porzellantreff','Geschirr wählen:\nWas passt auf\ndeinen Tisch?', [('Alltag','Größe und Anzahl der Teile planen.'),('Material','Pflegehinweise des Artikels beachten.'),('Set','Lieferumfang und Nachkauf prüfen.')]),
('rasendoktor','Rasendoktor','Gartenprodukte:\nBedarf vor\nWarenkorb.', [('Projekt','Fläche und eigentliche Aufgabe klären.'),('Menge','Packungsgröße mit deinem Bedarf prüfen.'),('Auswahl','Anwendung und Gesamtkosten vergleichen.')]),
('linguatv','LinguaTV','Sprachen lernen:\nWelches Format\npasst zu dir?', [('Ziel','Niveau und Lernziel festlegen.'),('Alltag','Zeitbedarf und Lernformat abgleichen.'),('Buchung','Zugang, Laufzeit und Preis prüfen.')]),
('magix','MAGIX','Kreativsoftware:\nErst dein\nProjekt klären.', [('Aufgabe','Video, Audio oder Fotos bearbeiten?'),('Gerät','Systemanforderungen vor dem Kauf lesen.'),('Lizenz','Version, Laufzeit und Folgekosten prüfen.')]),
('pizza-party','Pizza Party','Pizzaofen kaufen?\n3 Punkte\nvorher klären.', [('Platz','Aufstellung und Abstände prüfen.'),('Betrieb','Brennstoff und Bedienung abgleichen.'),('Budget','Zubehör und Lieferung mitrechnen.')]),
('moebel-inhofer','Möbel Inhofer','Möbel auswählen:\nErst messen.\nDann verlieben.', [('Raum','Stellmaß und Bewegungsfläche planen.'),('Transport','Türen, Treppen und Zugang mitmessen.'),('Bestellung','Lieferung und Montage prüfen.')]),
]
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def f(n,b=False):return ImageFont.truetype(BOLD if b else FONT,n)
def wrap(draw,txt,font,maxw):
 lines=[]; cur=''
 for word in txt.split():
  test=(cur+' '+word).strip()
  if draw.textlength(test,font=font)>maxw and cur:lines.append(cur);cur=word
  else:cur=test
 if cur:lines.append(cur)
 return lines
manifest=[]
for i,(slug,brand,title,tips) in enumerate(DATA):
 im=Image.new('RGB',(1000,1500),'#f3f1e9');d=ImageDraw.Draw(im)
 d.rounded_rectangle((26,26,974,1474),radius=42,outline='#cdd8ce',width=2)
 d.text((72,66),'AURA GLOBAL',font=f(27,True),fill='#183e31')
 d.text((72,108),'GUTE ENTSCHEIDUNGEN. KLARE KRITERIEN.',font=f(15,True),fill='#5b7667')
 # Original graphic: an editorial index, no product likeness or photo claim.
 d.rounded_rectangle((72,181,928,236),radius=22,fill='#dbe9dc')
 brandfont=f(23,True)
 d.text((94,190),brand.upper(),font=brandfont,fill='#214834')
 tf=f(68,True)
 for j,line in enumerate(title.split('\n')):
  assert d.textlength(line,font=tf)<860,(slug,line)
  d.text((72,277+j*84),line,font=tf,fill='#133e2e')
 d.line((72,567,928,567),fill='#b7cbbc',width=2)
 for k,(label,desc) in enumerate(tips):
  y=616+k*175
  d.rounded_rectangle((72,y,928,y+150),radius=22,fill='#ffffff',outline='#dce3d9',width=2)
  d.rounded_rectangle((96,y+26,161,y+91),radius=20,fill='#173e30')
  d.text((109,y+39),str(k+1).zfill(2),font=f(25,True),fill='#c5f1d4')
  d.text((187,y+22),label,font=f(30,True),fill='#1a4531')
  for n,line in enumerate(wrap(d,desc,f(25),690)):
   d.text((187,y+72+n*34),line,font=f(25),fill='#50665a')
 d.rounded_rectangle((72,1192,928,1276),radius=28,fill='#173e30')
 d.text((117,1214),'Kostenlose Kaufhilfe ansehen  →',font=f(32,True),fill='#f0fff4')
 d.text((72,1330),'auraglobal.vercel.app',font=f(33,True),fill='#1a4531')
 d.text((72,1391),'WERBUNG · KAUFHILFE MIT AWIN-LINKS',font=f(18,True),fill='#53695a')
 path=OUT/(slug+'.png');im.save(path,optimize=True)
 manifest.append({'slug':slug,'brand':brand,'title':title.replace('\n',' '),'tips':tips,'path':str(path.relative_to(ROOT)),'bytes':path.stat().st_size})
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
# RSS: add one stable original item per newly covered guide, without copying existing entries.
p=ROOT/'feed.xml';s=p.read_text();stamp='Sun, 01 Nov 2026 00:00:00 GMT'
items=[]
for m in manifest:
 guid='auraglobal:pin:'+m['slug']+':buying-check:20261101'
 if guid in s:continue
 url='https://auraglobal.vercel.app/'+m['slug']+'.html?utm_source=pinterest&utm_medium=organic&utm_campaign=buying_check_20261101&utm_content='+m['slug']
 img='https://auraglobal.vercel.app/'+m['path']
 desc='Werbung · '+m['brand']+' auf AuraGlobal: '+ '; '.join(x[1] for x in m['tips'])+' Redaktionelle Kaufhilfe mit gekennzeichneten Awin-Links. Keine eigenen Produkttests.'
 esc=lambda t:html.escape(t,quote=True)
 items.append('<item>\n<title>'+esc(m['title'])+'</title>\n<link>'+esc(url)+'</link>\n<guid isPermaLink="false">'+guid+'</guid>\n<description>'+esc(desc)+'</description>\n<pubDate>'+stamp+'</pubDate>\n<media:content url="'+esc(img)+'" medium="image" type="image/png" width="1000" height="1500"/>\n<enclosure url="'+esc(img)+'" length="'+str(m['bytes'])+'" type="image/png"/>\n</item>')
s=re.sub(r'<lastBuildDate>.*?</lastBuildDate>','<lastBuildDate>'+stamp+'</lastBuildDate>',s,count=1)
s=s.replace('<item>', '\n'.join(items)+'\n<item>',1) if items else s
s=s.replace('Illustratives Themenbild, kein Produktfoto. Aktuell kein Affiliate-Tracking.','Illustratives Themenbild, kein Produktfoto. Kaufhilfe mit gekennzeichneten Awin-Links.').replace('Symbolbild zur Büroausstattung, aktuell kein Affiliate-Tracking.','Symbolbild zur Büroausstattung. Kaufhilfe mit gekennzeichneten Awin-Links.')
p.write_text(s)
print(json.dumps({'cards':len(manifest),'new_feed_items':len(items),'total_image_bytes':sum(m['bytes'] for m in manifest)}))
# QA contact sheet, never deployed.
thumbs=Image.new('RGB',(1200,900),'#e3e9df')
for i,m in enumerate(manifest):
 im=Image.open(ROOT/m['path']);im.thumbnail((200,300));thumbs.paste(im,((i%6)*200,(i//6)*450))
thumbs.save('/workspace/scratch/auraglobal-pins-contact-sheet.jpg')
