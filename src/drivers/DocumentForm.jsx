import { useState, useEffect } from 'react';
import { saveDriverDocuments, fetchDriverDocuments } from '../utils/supabase';
import { Upload, Trash2, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function DocumentForm({ driver }) {
  const [documents, setDocuments] = useState({
    passportPic: null,     // { name: '', size: '', type: '', data: '' }
    tenthCertificate: null,
    drivingLicense: null,
    bikeImage: null
  });

  const [docErrors, setDocErrors] = useState({
    passportPic: '',
    tenthCertificate: '',
    drivingLicense: '',
    bikeImage: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'success', 'error', ''

  const driverName = `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Unnamed Partner';
  const email = driver.email || '';
  const phone = driver.phone || '';

  // Fetch existing documents from Supabase on mount
  useEffect(() => {
    async function loadDocuments() {
      if (!email) return;
      setIsLoading(true);
      try {
        const data = await fetchDriverDocuments(email);
        if (data) {
          setDocuments({
            passportPic: data.passport_pic ? {
              name: data.passport_pic_name || 'passport_photo.png',
              size: 'Uploaded',
              type: data.passport_pic.startsWith('data:image/') ? 'image/png' : 'application/pdf',
              data: data.passport_pic
            } : null,
            tenthCertificate: data.tenth_certificate ? {
              name: data.tenth_certificate_name || '10th_certificate.pdf',
              size: 'Uploaded',
              type: data.tenth_certificate.startsWith('data:image/') ? 'image/png' : 'application/pdf',
              data: data.tenth_certificate
            } : null,
            drivingLicense: data.driving_license ? {
              name: data.driving_license_name || 'driving_license.pdf',
              size: 'Uploaded',
              type: data.driving_license.startsWith('data:image/') ? 'image/png' : 'application/pdf',
              data: data.driving_license
            } : null,
            bikeImage: data.bike_image ? {
              name: data.bike_image_name || 'bike_image.png',
              size: 'Uploaded',
              type: data.bike_image.startsWith('data:image/') ? 'image/png' : 'application/pdf',
              data: data.bike_image
            } : null
          });
        }
      } catch (err) {
        console.error('Failed to load documents from database:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDocuments();
  }, [email]);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (section, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset error
    setDocErrors(prev => ({ ...prev, [section]: '' }));
    setSaveStatus('');

    // Check size limit (5 MB = 5 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setDocErrors(prev => ({
        ...prev,
        [section]: `❌ File size exceeds 5 MB limit. Selected file size: ${(file.size / (1024 * 1024)).toFixed(2)} MB.`
      }));
      e.target.value = '';
      return;
    }

    // Check type limit
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setDocErrors(prev => ({
        ...prev,
        [section]: `❌ Invalid file type. Only PDF, JPG, PNG are supported.`
      }));
      e.target.value = '';
      return;
    }

    try {
      const base64Data = await convertFileToBase64(file);
      setDocuments(prev => ({
        ...prev,
        [section]: {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type,
          data: base64Data
        }
      }));
    } catch (err) {
      console.error(err);
      setDocErrors(prev => ({
        ...prev,
        [section]: `❌ Failed to read file. Please try again.`
      }));
    }
  };

  const handleRemoveDoc = (section) => {
    setDocuments(prev => ({
      ...prev,
      [section]: null
    }));
    setDocErrors(prev => ({
      ...prev,
      [section]: ''
    }));
    setSaveStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveStatus('');

    try {
      const docData = {
        driver_id: driver.id,
        driver_name: driverName,
        email: email,
        mobile_number: phone,
        passport_pic: documents.passportPic ? documents.passportPic.data : null,
        passport_pic_name: documents.passportPic ? documents.passportPic.name : null,
        tenth_certificate: documents.tenthCertificate ? documents.tenthCertificate.data : null,
        tenth_certificate_name: documents.tenthCertificate ? documents.tenthCertificate.name : null,
        driving_license: documents.drivingLicense ? documents.drivingLicense.data : null,
        driving_license_name: documents.drivingLicense ? documents.drivingLicense.name : null,
        bike_image: documents.bikeImage ? documents.bikeImage.data : null,
        bike_image_name: documents.bikeImage ? documents.bikeImage.name : null
      };

      await saveDriverDocuments(docData);
      setSaveStatus('success');
      alert("🎉 Documents uploaded and saved to database successfully!");
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      alert("❌ Failed to save documents to database: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDocCard = (section, label) => {
    const doc = documents[section];
    const error = docErrors[section];
    const isImage = doc && doc.type && doc.type.startsWith('image/');

    return (
      <div key={section} style={{
        border: '1px solid #cbd5e1',
        borderRadius: '16px',
        padding: '1.25rem',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
        boxShadow: doc ? '0 4px 12px rgba(16, 185, 129, 0.02)' : 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>{label}</h4>
          {doc ? (
            <span style={{
              fontSize: '0.65rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}>Uploaded</span>
          ) : (
            <span style={{
              fontSize: '0.65rem',
              backgroundColor: '#e2e8f0',
              color: '#64748b',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}>Pending</span>
          )}
        </div>

        {/* File preview slot */}
        {doc ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            minHeight: '120px',
            gap: '8px'
          }}>
            {isImage && doc.data ? (
              <img 
                src={doc.data} 
                alt={label} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '90px', 
                  borderRadius: '6px', 
                  objectFit: 'contain',
                  border: '1px solid #f1f5f9'
                }}
              />
            ) : null}
            
            <div style={{ display: isImage && doc.data ? 'none' : 'block', color: '#0ea5e9' }}>
              <FileText size={36} />
            </div>

            <div style={{ textAlign: 'center', width: '100%' }}>
              <p style={{ 
                margin: '0 0 2px 0', 
                fontSize: '0.78rem', 
                fontWeight: '700', 
                color: '#1e293b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }} title={doc.name}>
                {doc.name}
              </p>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#64748b' }}>{doc.size}</p>
            </div>
          </div>
        ) : (
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem 1rem',
            backgroundColor: '#ffffff',
            border: '2.5px dashed #cbd5e1',
            borderRadius: '12px',
            cursor: 'pointer',
            minHeight: '120px',
            transition: 'all 0.2s ease',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0ea5e9';
            e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.01)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
          >
            <Upload size={24} style={{ color: '#94a3b8' }} />
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#0ea5e9', display: 'block' }}>Choose File</span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>PDF, JPG, PNG up to 5MB</span>
            </div>
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(section, e)}
            />
          </label>
        )}

        {/* Error message */}
        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '6px', 
            padding: '8px 10px', 
            backgroundColor: '#fef2f2', 
            borderRadius: '8px', 
            border: '1px solid #fca5a5'
          }}>
            <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: '600', lineHeight: '1.3' }}>{error}</span>
          </div>
        )}

        {/* Action Button */}
        {doc && (
          <button
            type="button"
            onClick={() => handleRemoveDoc(section)}
            style={{
              padding: '0.45rem',
              backgroundColor: 'transparent',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Trash2 size={12} />
            <span>Remove Document</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '24px',
      padding: '2.5rem 2rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      {/* Driver reference information */}
      <div style={{
        backgroundColor: 'rgba(14, 165, 233, 0.04)',
        border: '1.5px solid rgba(14, 165, 233, 0.15)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Database Registration References
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '4px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Driver Name</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '750', color: '#0f172a' }}>{driverName}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Email ID</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '750', color: '#0f172a' }}>{email}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Mobile Number</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '750', color: '#0f172a' }}>{phone || 'Not Provided'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {renderDocCard('passportPic', 'Passport Size Photo')}
        {renderDocCard('tenthCertificate', '10th Certificate')}
        {renderDocCard('drivingLicense', 'Driving License')}
        {renderDocCard('bikeImage', 'Bike Image')}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '0.9rem 1.8rem',
            fontWeight: '800',
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.15)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.25)'}
          onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.15)'}
        >
          {isLoading ? 'Uploading to Database...' : 'Save Documents '}
        </button>
      </div>
    </form>
  );
}
