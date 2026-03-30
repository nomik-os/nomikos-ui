import { useState, useRef } from 'react';
import { documentApi } from '../services/documentApi';
import Select from '../components/Select';
import '../styles/UserOptions.css';

interface FormState {
  assistance_type: string;
  forum: string;
  bench: string;
  filing_type: string;
  act: string;
  act_input: string;
  appeal_provision: string;
  application_type: string;
  interlocutory_type: string;
}

const ASSISTANCE_OPTIONS = [
  { label: 'Vetting of Draft', value: 'vetting_of_draft', next: 'vetting_flow' },
  { label: 'PDF For Filing', value: 'pdf_for_filing' },
  { label: 'Drafting Assistance', value: 'drafting_assistance' },
  { label: 'Courtroom Clerical Assistance', value: 'courtroom_clerical_assistance' },
];

const FORUM_OPTIONS = [
  'Supreme Court',
  'Delhi High Court',
  'NCLAT, Delhi',
  'NCDRC, Delhi',
  'NCLT',
  'DRT, Delhi',
];

const BENCH_OPTIONS = ['Delhi', 'Chennai'];

const FILING_TYPE_OPTIONS = [
  { label: 'Only Appeal', value: 'appeal', next: 'appeal_flow' },
  { label: 'Only Application', value: 'application', next: 'application_flow' },
  {
    label: 'Complete Appeal and Application',
    value: 'both',
    next: ['appeal_flow', 'application_flow'],
  },
];

const ACT_OPTIONS = [
  { label: 'Companies Act, 2013', value: 'companies_act' },
  { label: 'Competition Act, 2002', value: 'competition_act' },
  { label: 'Insolvency and Bankruptcy Code', value: 'ibc' },
  { label: 'Need Assistance', value: 'need_assistance', input_required: true },
];

const APPEAL_PROVISION_OPTIONS: Record<string, string[]> = {
  companies_act: ['Section 421', 'Section 132(5)'],
  competition_act: ['Section 53(B)'],
  ibc: ['Section 61(1)', 'Section 61(2)', 'Section 61(3)'],
};

const APPLICATION_TYPE_OPTIONS: Record<string, string[]> = {
  companies_act: [
    'Review Application',
    'Restoration Application',
    'Contempt Case',
    'Interlocutory Application',
    'Caveat',
  ],
  competition_act: [
    'Compensation Application',
    'Review Application',
    'Restoration Application',
    'Contempt Case',
    'Interlocutory Application',
    'Caveat',
  ],
  ibc: [
    'Review Application',
    'Restoration Application',
    'Contempt Case',
    'Interlocutory Application',
    'Caveat',
  ],
};

const INTERLOCUTORY_TYPE_OPTIONS = [
  'Condonation of delay in filing',
  'Condonation of delay in refiling',
  'Impleadment Application',
  'Application seeking directions',
  'Application seeking Intervention',
  'Exemption from filing Dim Annexures',
  'Exemption from filing Certified True Copy',
  'Stay Application',
  'Others',
];

export default function UserOptions() {
  const [form, setForm] = useState<FormState>({
    assistance_type: '',
    forum: '',
    bench: '',
    filing_type: '',
    act: '',
    act_input: '',
    appeal_provision: '',
    application_type: '',
    interlocutory_type: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>(
    'idle'
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === 'filing_type') {
        if (value !== 'appeal' && value !== 'both') {
          next.appeal_provision = '';
        }
        if (value !== 'application' && value !== 'both') {
          next.application_type = '';
          next.interlocutory_type = '';
        }
      }

      if (key === 'act') {
        next.appeal_provision = '';
        next.application_type = '';
        next.interlocutory_type = '';
      }

      if (key === 'application_type') {
        next.interlocutory_type = '';
      }

      return next;
    });
  };

  const ACCEPTED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'text/plain',
    'text/csv',
  ];

  const ACCEPTED_EXTENSIONS =
    '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.txt,.csv';

  const isValidFile = (file: File) => {
    return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.split(',').some((ext) => file.name.toLowerCase().endsWith(ext));
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter(isValidFile);
    if (validFiles.length === 0) return;
    setFiles((prev) => [...prev, ...validFiles]);
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadStatus('idle');
  };

  const moveFile = (from: number, to: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleFileDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      moveFile(dragIndex, index);
      setDragIndex(index);
    }
  };

  const handleFileDragEnd = () => {
    setDragIndex(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'doc' || ext === 'docx') return 'DOC';
    if (ext === 'xls' || ext === 'xlsx') return 'XLS';
    if (ext === 'ppt' || ext === 'pptx') return 'PPT';
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp') return 'IMG';
    if (ext === 'txt') return 'TXT';
    if (ext === 'csv') return 'CSV';
    return 'FILE';
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploadStatus('uploading');
    setUploadProgress(0);
    try {
      if (files.length === 1) {
        await documentApi.uploadDocument(files[0]);
      } else {
        await documentApi.mergeDocuments(files, setUploadProgress);
      }
      setUploadStatus('success');
    } catch {
      setUploadStatus('error');
    }
  };

  const showVettingFlow = form.assistance_type === 'vetting_of_draft';
  const showAppealFlow =
    showVettingFlow && (form.filing_type === 'appeal' || form.filing_type === 'both');
  const showApplicationFlow =
    showVettingFlow && (form.filing_type === 'application' || form.filing_type === 'both');
  const showActInput = form.act === 'need_assistance';

  const isVettingComplete =
    form.assistance_type === 'vetting_of_draft' &&
    form.forum !== '' &&
    form.bench !== '' &&
    form.filing_type !== '' &&
    form.act !== '' &&
    (!showActInput || form.act_input !== '') &&
    (!showAppealFlow || form.appeal_provision !== '') &&
    (!showApplicationFlow || form.application_type !== '') &&
    (form.application_type !== 'Interlocutory Application' || form.interlocutory_type !== '');

  const isNonVettingComplete =
    form.assistance_type !== '' && form.assistance_type !== 'vetting_of_draft';

  const allFieldsComplete = isVettingComplete || isNonVettingComplete;

  return (
    <div className="options">
      <div className="options__container">
        <header className="options__header">
          <h1 className="options__title">Select your assistance requirements</h1>
        </header>

        <form className="options__form">
          <section className="options__section">
            <Select
              id="assistance_type"
              label="Assistance Type"
              options={ASSISTANCE_OPTIONS}
              value={form.assistance_type}
              onChange={(v) => update('assistance_type', v)}
              placeholder="Select assistance type"
            />
          </section>

          {showVettingFlow && (
            <>
              <section className="options__section">
                <h2 className="options__section-title">Vetting Flow</h2>

                <Select
                  id="forum"
                  label="Forum"
                  options={FORUM_OPTIONS}
                  value={form.forum}
                  onChange={(v) => update('forum', v)}
                  placeholder="Select forum"
                />

                <Select
                  id="bench"
                  label="Bench"
                  options={BENCH_OPTIONS}
                  value={form.bench}
                  onChange={(v) => update('bench', v)}
                  placeholder="Select bench"
                />

                <Select
                  id="filing_type"
                  label="Filing Type"
                  options={FILING_TYPE_OPTIONS}
                  value={form.filing_type}
                  onChange={(v) => update('filing_type', v)}
                  placeholder="Select filing type"
                />

                <Select
                  id="act"
                  label="Act"
                  options={ACT_OPTIONS}
                  value={form.act}
                  onChange={(v) => update('act', v)}
                  placeholder="Select applicable act"
                />

                {showActInput && (
                  <div className="options__input-wrapper">
                    <label className="options__input-label" htmlFor="act_input">
                      Additional Details
                    </label>
                    <input
                      type="text"
                      id="act_input"
                      className="options__input"
                      placeholder="Please describe your assistance needed..."
                      value={form.act_input}
                      onChange={(e) => update('act_input', e.target.value)}
                    />
                  </div>
                )}
              </section>

              {showAppealFlow && form.act && form.act !== 'need_assistance' && (
                <section className="options__section">
                  <h2 className="options__section-title">Appeal Flow</h2>

                  <Select
                    id="appeal_provision"
                    label="Appeal Provision"
                    options={APPEAL_PROVISION_OPTIONS[form.act] || []}
                    value={form.appeal_provision}
                    onChange={(v) => update('appeal_provision', v)}
                    placeholder="Select provision"
                  />
                </section>
              )}

              {showApplicationFlow && form.act && form.act !== 'need_assistance' && (
                <section className="options__section">
                  <h2 className="options__section-title">Application Flow</h2>

                  <Select
                    id="application_type"
                    label="Application Type"
                    options={APPLICATION_TYPE_OPTIONS[form.act] || []}
                    value={form.application_type}
                    onChange={(v) => update('application_type', v)}
                    placeholder="Select application type"
                  />

                  {form.application_type === 'Interlocutory Application' && (
                    <Select
                      id="interlocutory_type"
                      label="Interlocutory Type"
                      options={INTERLOCUTORY_TYPE_OPTIONS}
                      value={form.interlocutory_type}
                      onChange={(v) => update('interlocutory_type', v)}
                      placeholder="Select interlocutory type"
                    />
                  )}
                </section>
              )}
            </>
          )}

          {allFieldsComplete && (
            <section className="options__section options__section--upload">
              <h2 className="options__section-title">Upload Documents</h2>
              <p className="options__upload-hint">
                Upload one or multiple files. Multiple files will be merged into a single PDF with
                sequential page numbering. Drag to reorder.
              </p>
              <p className="options__upload-formats">
                Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG, WEBP, TXT, CSV
              </p>

              <div
                className={`options__upload-area ${dragOver ? 'options__upload-area--dragover' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="document-upload"
                  className="options__upload-input"
                  accept={ACCEPTED_EXTENSIONS}
                  multiple
                  onChange={handleFileChange}
                />
                <label htmlFor="document-upload" className="options__upload-label">
                  <svg
                    className="options__upload-icon"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="options__upload-text">
                    Click to select or drag &amp; drop files
                  </span>
                  <span className="options__upload-subtext">
                    Select multiple files at once
                  </span>
                </label>
              </div>

              {files.length > 0 && (
                <>
                  <div className="options__file-list">
                    <div className="options__file-list-header">
                      <span>{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
                      <button
                        type="button"
                        className="options__clear-btn"
                        onClick={() => {
                          setFiles([]);
                          setUploadStatus('idle');
                        }}
                      >
                        Clear all
                      </button>
                    </div>
                    {files.map((f, i) => (
                      <div
                        key={`${f.name}-${f.size}-${i}`}
                        className={`options__file-item ${dragIndex === i ? 'options__file-item--dragging' : ''}`}
                        draggable
                        onDragStart={() => handleFileDragStart(i)}
                        onDragOver={(e) => handleFileDragOver(e, i)}
                        onDragEnd={handleFileDragEnd}
                      >
                        <span className="options__file-order">{i + 1}</span>
                        <span className="options__file-grip" title="Drag to reorder">⠿</span>
                        <span className="options__file-type-badge">{getFileIcon(f)}</span>
                        <div className="options__file-info">
                          <span className="options__file-name">{f.name}</span>
                          <span className="options__file-size">{formatFileSize(f.size)}</span>
                        </div>
                        <button
                          type="button"
                          className="options__file-remove"
                          onClick={() => removeFile(i)}
                          title="Remove file"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    {files.length > 1 && (
                      <p className="options__merge-note">
                        Files will be merged in the order shown above into a single PDF.
                      </p>
                    )}
                  </div>

                  {uploadStatus === 'uploading' && (
                    <div className="options__progress">
                      <div className="options__progress-bar">
                        <div
                          className="options__progress-fill"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="options__progress-text">{uploadProgress}%</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="options__btn options__btn--primary"
                    onClick={handleUpload}
                    disabled={uploadStatus === 'uploading'}
                  >
                    {uploadStatus === 'uploading'
                      ? 'Processing...'
                      : files.length > 1
                        ? `Merge & Upload ${files.length} Files`
                        : 'Upload Document'}
                  </button>
                </>
              )}

              {uploadStatus === 'success' && (
                <p className="options__upload-success">
                  {files.length > 1
                    ? 'Documents merged and uploaded successfully!'
                    : 'Document uploaded successfully!'}
                </p>
              )}
              {uploadStatus === 'error' && (
                <p className="options__upload-error">
                  Failed to process documents. Please try again.
                </p>
              )}
            </section>
          )}
        </form>
      </div>
    </div>
  );
}
