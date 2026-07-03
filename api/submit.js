// Vercel serverless function: receives the filled worksheet and emails it to Talkerstein via Resend.
function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}

export default async function handler(req, res){
  if(req.method !== 'POST'){ res.status(405).json({ok:false,error:'POST only'}); return; }
  try{
    var body = req.body;
    if(typeof body === 'string'){ try{ body = JSON.parse(body||'{}'); }catch(e){ body = {}; } }
    var sections = (body && body.sections) || [];
    var when = (body && body.when) || '';
    var who  = (body && body.who) || '';
    var replyTo = (body && body.email) || '';

    if(!sections.length){ res.status(400).json({ok:false,error:'Nothing filled in yet.'}); return; }

    var html = '<div style="font-family:Georgia,\'Times New Roman\',serif;color:#181818;max-width:640px">';
    html += '<h2 style="font-weight:normal">RALPH — Imagery Worksheet</h2>';
    html += '<p style="color:#6f6a63;margin:0 0 4px">Submitted' + (who?(' by <b>'+esc(who)+'</b>'):'') + (when?(' · '+esc(when)):'') + '</p><hr style="border:none;border-top:1px solid #e4ded2">';
    var text = 'RALPH — Imagery Worksheet\nSubmitted' + (who?(' by '+who):'') + (when?(' · '+when):'') + '\n\n';

    sections.forEach(function(s){
      html += '<h3 style="color:#b08d57;font-weight:normal;margin:20px 0 6px">' + esc(s.section) + '</h3><ul style="margin:0;padding-left:18px;line-height:1.6">';
      text += '== ' + s.section + ' ==\n';
      (s.lines||[]).forEach(function(l){ html += '<li>' + esc(l) + '</li>'; text += '  • ' + l + '\n'; });
      html += '</ul>';
      text += '\n';
    });
    html += '</div>';

    var key = process.env.RESEND_API_KEY;
    if(!key){ res.status(500).json({ok:false,error:'Email not configured (missing key).'}); return; }

    var payload = {
      from: 'RALPH Worksheet <worksheet@talkerstein.ca>',
      to: ['hi@talkerstein.ca'],
      subject: 'Gitty’s RALPH Worksheet' + (who?(' — '+who):'') + (when?(' — '+when):''),
      html: html,
      text: text
    };
    if(replyTo && /.+@.+\..+/.test(replyTo)) payload.reply_to = replyTo;

    var r = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{ 'Authorization':'Bearer '+key, 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    if(!r.ok){ var e = await r.text(); res.status(502).json({ok:false,error:'Send failed: '+e}); return; }
    res.status(200).json({ok:true});
  }catch(err){
    res.status(500).json({ok:false,error:String(err && err.message || err)});
  }
}
