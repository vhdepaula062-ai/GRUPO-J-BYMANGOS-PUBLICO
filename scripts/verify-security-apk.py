"""Inspect the finished APK without writing or printing secret values."""
from pathlib import Path
import hashlib,json,os,re,zipfile

root=Path(__file__).resolve().parent.parent
apk=root/'artifacts/android/grupo-j-staging.apk'
values={}
for line in (root/'.env').read_text(encoding='utf-8-sig').splitlines():
    match=re.match(r'^([A-Z_]+)=(.*)$',line)
    if match and match[1] in {'SUPABASE_SERVICE_ROLE_KEY','CPF_ENCRYPTION_KEY','CPF_BLIND_INDEX_PEPPER','SESSION_SECRET'}:
        value=match[2].strip().strip('\"\'')
        if len(value)>=16: values[match[1]]=value.encode()
signing=os.environ.get('GJ_STAGING_KEYSTORE_PASSWORD')
if signing: values['ANDROID_SIGNING_PASSWORD']=signing.encode()
assert 'SUPABASE_SERVICE_ROLE_KEY' in values and signing,'Verification credentials unavailable'
hits=[]
with zipfile.ZipFile(apk) as archive:
    names=archive.namelist()
    assert not any(n.lower().endswith(('.keystore','.jks','.p12','.dpapi','.env')) for n in names),'Unexpected private file in APK'
    bundle=archive.read('assets/index.android.bundle')
    assert b'confirmationEmailSent' in bundle,'Updated registration flow absent'
    for item in archive.infolist():
        if item.is_dir(): continue
        content=archive.read(item)
        for name,secret in values.items():
            if secret in content: hits.append({'keyName':name,'entry':item.filename})
assert not hits,'Server or signing credential detected in APK'
evidence={'apkSha256':hashlib.sha256(apk.read_bytes()).hexdigest(),'privateFilesAbsent':True,'knownServerAndSigningSecretsAbsent':True,'updatedConfirmationFlowPresent':True,'entriesChecked':len(names),'secretValuesChecked':len(values)}
(root/'artifacts/security-apk-remediation.json').write_text(json.dumps(evidence,indent=2),encoding='utf-8')
print(json.dumps(evidence))
