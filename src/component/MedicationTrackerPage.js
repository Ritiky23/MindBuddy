// src/pages/MedicationTrackerPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db, auth } from './firebaseConfig'; // Adjust path to your firebase.js
import {
    collection, addDoc, query, where, onSnapshot,
    doc, updateDoc, deleteDoc, serverTimestamp, arrayUnion
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
// At the top of your MedicationTrackerPage.js
import { useNavigate } from 'react-router-dom'; // Or: import { Link } from 'react-router-dom';


// --- Enhanced Global Styles & Variables (Inspired by your CSS) ---
const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&display=swap');

        :root {
          --primary-color: #5C6BC0; /* Calming Indigo */
          --primary-darker: #3F51B5;
          --primary-lighter: #7986CB; /* Lighter Indigo for gradients */
          --secondary-color: #81C784; /* Slightly more vibrant Soft Green */
          --secondary-color-light: #A5D6A7; /* Original soft green */
          --accent-color: #FFCA28; /* Warm Amber for accents */
          --accent-darker: #FFA000;
          --text-color: #263238; /* Darker for better contrast */
          --text-light: #546E7A;
          --bg-color: #F4F6F8; /* Very light, almost white-blueish grey */
          --bg-light: #FFFFFF;
          --border-color: #DDE2E7;
          --shadow-color: rgba(40, 50, 90, 0.1); /* Bluish shadow */
          --shadow-color-light: rgba(40, 50, 90, 0.05);
          --danger-color: #EF4444; /* For danger buttons */
          --danger-color-soft: #E57373; /* Softer red for some contexts */


          --font-primary: 'Poppins', sans-serif;
          --font-secondary: 'Merriweather', serif;

          --border-radius: 12px; /* Slightly larger radius */
          --border-radius-small: 8px;
          --transition-speed: 0.3s;
          --transition-speed-fast: 0.2s;
        }

        body { /* Applied to the whole page if this component is a main page */
          margin: 0;
          font-family: var(--font-primary);
          background-color: var(--bg-color);
          color: var(--text-color);
          line-height: 1.7;
          font-size: 16px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* General Button Hover from your theme */
        .themed-button {
            transition: all var(--transition-speed) ease;
        }
        .themed-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px var(--shadow-color) !important; /* Ensure override */
            opacity: 0.9; /* Slight opacity change */
        }
        .themed-button-secondary:hover {
            background-color: var(--border-color) !important; /* Specific hover for secondary */
        }

        .themed-card-hover {
            transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease, border-color var(--transition-speed) ease;
        }
        .themed-card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 30px var(--shadow-color) !important;
            border-color: var(--primary-lighter) !important;
        }
        
        /* Input focus style */
        .themed-input:focus, .themed-textarea:focus, .themed-select:focus {
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 3px rgba(92, 107, 192, 0.25) !important; /* Indigo focus ring */
            outline: none; /* Remove default outline */
        }

        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
    `}</style>
);


const styles = {
    container: {
        fontFamily: 'var(--font-primary)',
        maxWidth: '1000px',
        margin: '40px auto',
        padding: '30px',
        backgroundColor: 'var(--bg-light)',
        borderRadius: 'var(--border-radius)',
        boxShadow: '0 10px 30px var(--shadow-color)',
    },
    header: {
        fontFamily: 'var(--font-secondary)',
        fontSize: '2.5rem',
        color: 'var(--primary-darker)',
        textAlign: 'center',
        marginBottom: '30px',
        fontWeight: '700',
    },
    nav: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '30px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '15px',
    },
    navButtonBase: { // Renamed from navButton to avoid conflict with (isActive) function
        fontFamily: 'var(--font-primary)',
        padding: '12px 25px',
        margin: '0 10px',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: 'transparent',
        borderRadius: 'var(--border-radius-small)',
        fontWeight: '500',
        fontSize: '1rem',
        transition: 'all var(--transition-speed-fast) ease',
        position: 'relative',
        textDecoration: 'none',
    },
    navButtonActive: {
        color: 'var(--primary-color)',
        fontWeight: '600',
    },
    navButtonInactive: {
        color: 'var(--text-light)',
    },
    button: (variant = 'primary', size = 'normal') => ({
        fontFamily: 'var(--font-primary)',
        padding: size === 'small' ? '8px 15px' : '12px 25px',
        backgroundColor: variant === 'primary' ? 'var(--primary-color)' :
                         variant === 'success' ? 'var(--secondary-color)' :
                         variant === 'danger' ? 'var(--danger-color)' :
                         variant === 'accent' ? 'var(--accent-color)' :
                         'var(--text-light)',
        color: (variant === 'accent') ? 'var(--text-color)' : 'var(--bg-light)', // Accent usually has dark text
        border: 'none',
        borderRadius: '50px',
        cursor: 'pointer',
        fontSize: size === 'small' ? '0.9rem' : '1rem',
        fontWeight: '600',
        margin: '5px',
        // transition property moved to .themed-button class for global hover
        boxShadow: '0 4px 15px var(--shadow-color-light)',
        letterSpacing: '0.5px',
        textTransform: 'capitalize',
    }),
    medicationCard: {
        backgroundColor: 'var(--bg-light)',
        padding: '25px',
        marginBottom: '20px',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 25px var(--shadow-color-light)',
        // transition property moved to .themed-card-hover class
    },
    medicationName: {
        fontFamily: 'var(--font-primary)',
        fontSize: '1.5rem',
        fontWeight: '600',
        color: 'var(--primary-darker)',
        marginBottom: '10px',
    },
    medicationDetail: {
        fontSize: '0.95rem',
        color: 'var(--text-light)',
        marginBottom: '8px',
        lineHeight: '1.6',
    },
    doseTimeSlot: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 0',
        borderBottom: '1px dashed var(--border-color)',
        marginTop: '10px',
    },
    doseStatus: (status) => ({
        fontWeight: '600',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        color: status === 'taken' ? 'var(--bg-light)' :
               status === 'skipped' ? 'var(--bg-light)' :
               'var(--text-color)',
        backgroundColor: status === 'taken' ? 'var(--secondary-color)' :
                         status === 'skipped' ? 'var(--danger-color-soft)' :
                         'var(--accent-color)',
        textTransform: 'capitalize',
    }),
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(30, 39, 46, 0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(5px)',
    },
    modalContent: {
        backgroundColor: 'var(--bg-light)',
        padding: '35px 40px',
        borderRadius: 'var(--border-radius)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
    },
    formGroup: { marginBottom: '20px' },
    label: {
        display: 'block', marginBottom: '8px', fontWeight: '500',
        color: 'var(--text-color)', fontSize: '0.95rem',
    },
    inputShared: {
        width: 'calc(100% - 28px)', // Adjusted for 14px padding on each side
        padding: '14px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-small)',
        fontSize: '1rem',
        fontFamily: 'var(--font-primary)',
        color: 'var(--text-color)',
        backgroundColor: 'var(--bg-light)',
        transition: 'border-color var(--transition-speed-fast) ease, box-shadow var(--transition-speed-fast) ease',
    },
    selectShared: {
        width: '100%',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%235C6BC0' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1em',
        paddingRight: '2.5rem', // Make space for arrow
    },
    textareaShared: {
        minHeight: '100px',
        resize: 'vertical',
    },
    timeInputContainer: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
    timeInput: { flexGrow: 1, marginRight: '10px' },
    noData: {
        textAlign: 'center', color: 'var(--text-light)', marginTop: '50px',
        fontSize: '1.1rem', padding: '30px', backgroundColor: 'var(--bg-light)',
        borderRadius: 'var(--border-radius)', boxShadow: '0 5px 15px var(--shadow-color-light)',
    },
    alertModalContent: {
        backgroundColor: 'var(--bg-light)',
        padding: '30px 35px',
        borderRadius: 'var(--border-radius)',
        width: '90%',
        maxWidth: '480px',
        textAlign: 'center',
        boxShadow: '0 10px 30px var(--shadow-color)',
    },
    alertIcon: (type) => ({
        fontSize: '3rem', marginBottom: '20px',
        color: type === 'success' ? 'var(--secondary-color)' :
               type === 'error' ? 'var(--danger-color)' :
               type === 'confirm' ? 'var(--primary-color)' :
               'var(--accent-color)'
    }),
    alertMessage: {
        fontSize: '1.15rem', color: 'var(--text-color)',
        marginBottom: '25px', lineHeight: '1.6',
    },
    alertActions: { display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' },
    spinnerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' },
    spinner: {
        border: '5px solid #E3E8EE',
        borderTop: '5px solid var(--primary-color)',
        borderRadius: '50%', width: '50px', height: '50px',
        animation: 'spin 1.2s linear infinite',
    },
};


const CustomModal = ({ isOpen, type, message, onConfirm, onCancel, promptInput, setPromptInput, promptPlaceholder }) => {
    if (!isOpen) return null;

    const Icon = () => {
        switch (type) {
            case 'success': return <span style={styles.alertIcon(type)}>✓</span>;
            case 'error': return <span style={styles.alertIcon(type)}>✕</span>;
            case 'confirm': return <span style={styles.alertIcon(type)}>?</span>;
            case 'prompt': return <span style={styles.alertIcon('confirm')}>✎</span>;
            default: return <span style={styles.alertIcon('info')}>ℹ</span>;
        }
    };

    return (
        <div style={styles.modalOverlay} onClick={type !== 'prompt' && type !== 'confirm' ? onCancel : undefined}>
            <div style={styles.alertModalContent} onClick={(e) => e.stopPropagation()}>
                <Icon />
                <p style={styles.alertMessage}>{message}</p>
                {type === 'prompt' && promptInput !== undefined && setPromptInput && (
                    <input
                        type="text"
                        className="themed-input"
                        style={{...styles.inputShared, marginBottom: '20px'}}
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder={promptPlaceholder || "Enter value..."}
                        autoFocus
                    />
                )}
                <div style={styles.alertActions}>
                    { (type === 'confirm' || type === 'prompt') && onCancel && (
                        <button className="themed-button themed-button-secondary" style={{...styles.button('secondary'), backgroundColor: 'transparent', color: 'var(--text-light)', border: `1px solid var(--border-color)`}} onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                    <button className="themed-button" style={{...styles.button(type === 'error' ? 'danger' : (type === 'confirm' || type === 'prompt' ? 'primary' : 'success'))}} onClick={onConfirm}>
                        {type === 'confirm' ? 'Confirm' : type === 'prompt' ? 'Submit' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const MedicationTrackerPage = () => {
    const navigate = useNavigate();
    const handleGoHome = () => {
        navigate('/home'); // Or '/home', or whatever your home route is
    };
    const [medications, setMedications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [currentMedication, setCurrentMedication] = useState(null);
    const [view, setView] = useState('today');
    const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'info', message: '', onConfirm: () => {}, onCancel: null });
    const [promptValue, setPromptValue] = useState('');

    const initialFormState = {
        name: '', dosage: '', form: 'Pill', frequencyType: 'specific_times',
        schedule: [{ id: uuidv4(), time: '08:00' }], maxDailyDoses: 1, prnReason: '', notes: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const userId = auth.currentUser?.uid;

    const showAlert = (type, message, onConfirmCallback, onCancelCallback = null) => { setAlertModal({ isOpen: true, type, message, onConfirm: () => { setAlertModal({ isOpen: false }); if(onConfirmCallback) onConfirmCallback(); }, onCancel: onCancelCallback ? () => { setAlertModal({ isOpen: false }); onCancelCallback(); } : null }); };
    const showPrompt = (message, placeholder, onConfirmCallback, onCancelCallback = null) => { setPromptValue(''); setAlertModal({ isOpen: true, type: 'prompt', message, promptInput: promptValue, setPromptInput: setPromptValue, promptPlaceholder: placeholder, onConfirm: () => { setAlertModal({ isOpen: false }); if(onConfirmCallback) onConfirmCallback(promptValue); }, onCancel: () => { setAlertModal({ isOpen: false }); if(onCancelCallback) onCancelCallback(); }}); };
    
    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            showAlert("error", "User not authenticated. Please log in.", () => {});
            setMedications([]);
            return;
        }
        setIsLoading(true);
        const medsCollectionRef = collection(db, 'medications');
        const q = query(medsCollectionRef, where('userId', '==', userId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const medsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMedications(medsData);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching medications:", err);
            showAlert("error", "Failed to fetch medications. Please try again.", () => {});
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [userId]);

    const handleInputChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleScheduleTimeChange = (index, timeValue) => { const updatedSchedule = formData.schedule.map((item, i) => i === index ? { ...item, time: timeValue } : item ); setFormData(prev => ({ ...prev, schedule: updatedSchedule }));};
    const addScheduleTimeSlot = () => { setFormData(prev => ({ ...prev, schedule: [...prev.schedule, { id: uuidv4(), time: '12:00' }] }));};
    const removeScheduleTimeSlot = (index) => { setFormData(prev => ({ ...prev, schedule: prev.schedule.filter((_, i) => i !== index) }));};

    const openModalForAdd = () => { setCurrentMedication(null); setFormData(initialFormState); setShowFormModal(true); };
    const openModalForEdit = (med) => { setCurrentMedication(med); setFormData({ name: med.name || '', dosage: med.dosage || '', form: med.form || 'Pill', frequencyType: med.frequencyType || 'specific_times', schedule: med.schedule && med.schedule.length > 0 ? med.schedule.map(s => ({...s})) : [{ id: uuidv4(), time: '08:00' }], maxDailyDoses: med.maxDailyDoses || 1, prnReason: med.prnReason || '', notes: med.notes || '' }); setShowFormModal(true); };
    const closeModal = () => { setShowFormModal(false); setCurrentMedication(null); setFormData(initialFormState); };

    const handleSubmitMedication = async (e) => {
        e.preventDefault();
        if (!userId) { showAlert("error", "User not authenticated.", () => {}); return; }
        if (!formData.name || !formData.dosage) { showAlert("warning", "Medication name and dosage are required.", () => {}); return; }

        const medicationData = { userId, ...formData, schedule: formData.frequencyType === 'specific_times' ? formData.schedule : [], maxDailyDoses: formData.frequencyType === 'as_needed' ? Number(formData.maxDailyDoses) : null, prnReason: formData.frequencyType === 'as_needed' ? formData.prnReason : '', updatedAt: serverTimestamp() };
        try {
            if (currentMedication) {
                await updateDoc(doc(db, 'medications', currentMedication.id), medicationData);
                showAlert("success", "Medication updated successfully!", () => {});
            } else {
                await addDoc(collection(db, 'medications'), { ...medicationData, createdAt: serverTimestamp(), doseHistory: [] });
                showAlert("success", "Medication added successfully!", () => {});
            }
            closeModal();
        } catch (err) { console.error("Error saving medication: ", err); showAlert("error", "Failed to save medication.", () => {}); }
    };

    const handleDeleteMedication = (medId, medName) => {
        showAlert("confirm", `Are you sure you want to delete "${medName}"? This action cannot be undone.`, async () => {
            try {
                await deleteDoc(doc(db, 'medications', medId));
                showAlert("success", `"${medName}" deleted successfully.`, () => {});
            } catch (err) { console.error("Error deleting medication: ", err); showAlert("error", "Failed to delete medication.", () => {});}
        });
    };

    const getTodayDateString = () => new Date().toISOString().split('T')[0];

    const logDose = async (medicationId, scheduleSlotId, scheduledTime, status, forPRN = false, prnNotes = "") => {
        if (!userId) { showAlert("error", "User not authenticated to log dose.", () => {}); return; }
        const medDocRef = doc(db, 'medications', medicationId);
        const today = getTodayDateString();
        const doseLogEntry = { id: uuidv4(), date: today, status: status, loggedAt: new Date() };
        if (forPRN) {
            doseLogEntry.type = 'prn';
            doseLogEntry.takenAtTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            if (prnNotes) { doseLogEntry.notes = prnNotes; }
        } else {
            doseLogEntry.type = 'scheduled';
            doseLogEntry.scheduleSlotId = scheduleSlotId;
            doseLogEntry.scheduledTime = scheduledTime;
        }
        try { await updateDoc(medDocRef, { doseHistory: arrayUnion(doseLogEntry) }); }
        catch (err) { console.error("Detailed error logging dose: ", err); showAlert("error", `Failed to log dose. Code: ${err.code || 'N/A'}. Message: ${err.message || 'Unknown error'}`, () => {}); }
    };

    const getDoseStatusForToday = (medication, scheduleSlot) => { if (!medication.doseHistory) return null; const today = getTodayDateString(); const logEntry = medication.doseHistory.find( entry => entry.date === today && entry.scheduleSlotId === scheduleSlot.id && entry.type === 'scheduled'); return logEntry ? logEntry.status : null; };

    const LoadingSpinner = () => (
        <div style={styles.spinnerContainer}>
            <div style={styles.spinner}></div>
        </div>
    );

    const memoizedTodayView = useMemo(() => {
        const today = new Date();
        const todayStr = getTodayDateString();
        let anyMedicationScheduledToday = false;

        const upcomingDoses = medications
            .filter(med => med.frequencyType === 'specific_times' && med.schedule && med.schedule.length > 0)
            .flatMap(med => med.schedule.map(slot => ({ ...med, scheduleSlotId: slot.id, scheduledTime: slot.time, statusToday: getDoseStatusForToday(med, slot) })))
            .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
        
        const prnMedications = medications.filter(med => med.frequencyType === 'as_needed');
        const prnDosesTakenToday = medications.flatMap(med => med.doseHistory ? med.doseHistory.filter(h => h.date === todayStr && h.type === 'prn') : []);

        if (upcomingDoses.length > 0 || prnMedications.length > 0) anyMedicationScheduledToday = true;

        if (isLoading) return <LoadingSpinner />;
        if (!anyMedicationScheduledToday && medications.length > 0) return <div style={styles.noData}>No medications scheduled or available as needed for today.</div>;
        if (medications.length === 0 && !isLoading) return <div style={styles.noData}>No medications added yet. Add a medication to get started!</div>;

        return (
            <div>
                <h3 style={{ fontFamily: 'var(--font-secondary)', fontSize: '1.8rem', fontWeight: '600', color: 'var(--text-color)', marginBottom: '20px', borderBottom: `2px solid var(--primary-lighter)`, paddingBottom: '10px' }}>
                    Scheduled Doses: {today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                {upcomingDoses.length === 0 && <p style={styles.medicationDetail}>No doses specifically scheduled for today.</p>}
                {upcomingDoses.map((doseItem) => (
                    <div key={`${doseItem.id}-${doseItem.scheduleSlotId}`} style={styles.medicationCard} className="themed-card-hover">
                        <div style={styles.medicationName}>{doseItem.name}</div>
                        <div style={styles.medicationDetail}>Dosage: {doseItem.dosage} • Form: {doseItem.form}</div>
                        <div style={styles.doseTimeSlot}>
                            <span style={{fontSize: '1rem', fontWeight: '500', color: 'var(--text-light)'}}>Scheduled: {doseItem.scheduledTime}</span>
                            {doseItem.statusToday ?
                                <span style={styles.doseStatus(doseItem.statusToday)}>{doseItem.statusToday}</span> :
                                <div style={{display: 'flex', gap: '10px'}}>
                                    <button className="themed-button" style={styles.button('success')} onClick={() => logDose(doseItem.id, doseItem.scheduleSlotId, doseItem.scheduledTime, 'taken')}>Take</button>
                                    <button className="themed-button themed-button-secondary" style={{...styles.button('secondary'), backgroundColor: 'var(--bg-light)', color: 'var(--text-light)', border: `1px solid var(--border-color)`}} onClick={() => logDose(doseItem.id, doseItem.scheduleSlotId, doseItem.scheduledTime, 'skipped')}>Skip</button>
                                </div>
                            }
                        </div>
                         {doseItem.notes && <p style={{...styles.medicationDetail, marginTop: '10px', fontStyle: 'italic', backgroundColor: 'var(--bg-color)', padding: '10px', borderRadius: 'var(--border-radius-small)'}}>Notes: {doseItem.notes}</p>}
                    </div>
                ))}

                <h3 style={{ fontFamily: 'var(--font-secondary)', fontSize: '1.8rem', fontWeight: '600', color: 'var(--text-color)', marginBottom: '20px', marginTop: '40px', borderBottom: `2px solid var(--primary-lighter)`, paddingBottom: '10px' }}>As Needed (PRN)</h3>
                {prnMedications.length === 0 && <p style={styles.medicationDetail}>No "as needed" medications added.</p>}
                {prnMedications.map(med => {
                    const takenCountToday = med.doseHistory ? med.doseHistory.filter(h => h.date === todayStr && h.type === 'prn' && h.status === 'taken').length : 0;
                    return (
                        <div key={med.id} style={styles.medicationCard} className="themed-card-hover">
                            <div style={styles.medicationName}>{med.name}</div>
                            <div style={styles.medicationDetail}>Dosage: {med.dosage} • Form: {med.form}</div>
                            <div style={styles.medicationDetail}>Reason: {med.prnReason || 'Not specified'}</div>
                            <div style={styles.medicationDetail}>Max Daily: {med.maxDailyDoses || 'N/A'}</div>
                            {med.notes && <p style={{...styles.medicationDetail, marginTop: '10px', fontStyle: 'italic', backgroundColor: 'var(--bg-color)', padding: '10px', borderRadius: 'var(--border-radius-small)'}}>Notes: {med.notes}</p>}
                            <div style={styles.doseTimeSlot}>
                                <span style={{fontSize: '1rem', color: 'var(--text-light)'}}>Taken today: {takenCountToday}</span>
                                {(!med.maxDailyDoses || takenCountToday < med.maxDailyDoses) ? (
                                    <button className="themed-button" style={styles.button('accent')} onClick={() => {
                                        showPrompt(
                                            `Log PRN: ${med.name}`,
                                            "Optional note (e.g., reason for taking)",
                                            (notes) => logDose(med.id, null, null, 'taken', true, notes || "")
                                        );
                                    }}>Log As Taken</button>
                                ) : <span style={styles.doseStatus('pending')}>Max Reached</span>}
                            </div>
                        </div>
                    );
                })}
                 {prnDosesTakenToday.length > 0 && (
                    <>
                        <h4 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-color)', marginTop: '25px', marginBottom: '10px' }}>PRN Doses Logged Today:</h4>
                        {prnDosesTakenToday.map(log => {
                            const medName = medications.find(m => m.doseHistory && m.doseHistory.some(h => h.id === log.id))?.name;
                            return (
                                <div key={log.id} style={{...styles.medicationDetail, padding: '10px 15px', marginBottom:'8px', backgroundColor: 'var(--primary-lighter)', color: 'var(--bg-light)', borderRadius: 'var(--border-radius-small)', boxShadow: '0 2px 5px var(--shadow-color-light)'}}>
                                    <strong>{medName || 'Medication'}</strong> taken at {log.takenAtTime}
                                    {log.notes ? <span style={{display: 'block', fontSize:'0.85rem', opacity: 0.9}}><em>Note: {log.notes}</em></span> : ''}
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [medications, isLoading, userId, view]);


    const memoizedAllMedicationsView = useMemo(() => {
        if (isLoading) return <LoadingSpinner />;
        if (medications.length === 0 && !isLoading) return <div style={styles.noData}>No medications added yet. Click "+ Add New Medication" to begin.</div>;

        return (
            <div>
                <h3 style={{ fontFamily: 'var(--font-secondary)', fontSize: '1.8rem', fontWeight: '600', color: 'var(--text-color)', marginBottom: '20px', borderBottom: `2px solid var(--primary-lighter)`, paddingBottom: '10px' }}>
                    All My Medications
                </h3>
                {medications.map(med => (
                    <div key={med.id} style={styles.medicationCard} className="themed-card-hover">
                        <div style={styles.medicationName}>{med.name}</div>
                        <div style={styles.medicationDetail}>Dosage: {med.dosage} • Form: {med.form}</div>
                        {med.frequencyType === 'specific_times' && med.schedule && (
                            <div style={styles.medicationDetail}>
                                Scheduled: {med.schedule.map(s => s.time).join(', ')}
                            </div>
                        )}
                        {med.frequencyType === 'as_needed' && (
                             <div style={styles.medicationDetail}>
                                As Needed: {med.prnReason || 'Reason not specified'} (Max: {med.maxDailyDoses || 'N/A'} per day)
                            </div>
                        )}
                        {med.notes && <p style={{...styles.medicationDetail, marginTop: '10px', fontStyle: 'italic', backgroundColor: 'var(--bg-color)', padding: '10px', borderRadius: 'var(--border-radius-small)'}}>Notes: {med.notes}</p>}
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button className="themed-button themed-button-secondary" style={{...styles.button('secondary', 'small'), backgroundColor: 'var(--bg-light)', color: 'var(--text-light)', border: `1px solid var(--border-color)`}} onClick={() => openModalForEdit(med)}>Edit</button>
                            <button className="themed-button" style={styles.button('danger', 'small')} onClick={() => handleDeleteMedication(med.id, med.name)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [medications, isLoading, userId, view]);
    
    const renderMedicationFormModal = () => {
        if (!showFormModal) return null;
        return (
            <div style={styles.modalOverlay} onClick={closeModal}>
                <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h2 style={{fontFamily: 'var(--font-secondary)', fontSize: '1.8rem', fontWeight: '600', color: 'var(--primary-darker)', marginBottom: '25px', textAlign: 'center' }}>
                        {currentMedication ? 'Edit Medication' : 'Add New Medication'}
                    </h2>
                    <form onSubmit={handleSubmitMedication}>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="name">Medication Name:</label>
                            <input className="themed-input" style={styles.inputShared} type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="dosage">Dosage (e.g., 10mg, 1 tablet):</label>
                            <input className="themed-input" style={styles.inputShared} type="text" id="dosage" name="dosage" value={formData.dosage} onChange={handleInputChange} required />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="form">Form:</label>
                            <select className="themed-select" style={{...styles.inputShared, ...styles.selectShared}} id="form" name="form" value={formData.form} onChange={handleInputChange}>
                                <option value="Pill">Pill</option> <option value="Capsule">Capsule</option> <option value="Liquid">Liquid</option> <option value="Inhaler">Inhaler</option> <option value="Injection">Injection</option> <option value="Patch">Patch</option> <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="frequencyType">Frequency Type:</label>
                            <select className="themed-select" style={{...styles.inputShared, ...styles.selectShared}} id="frequencyType" name="frequencyType" value={formData.frequencyType} onChange={handleInputChange}>
                                <option value="specific_times">Specific Times</option> <option value="as_needed">As Needed (PRN)</option>
                            </select>
                        </div>

                        {formData.frequencyType === 'specific_times' && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Scheduled Times:</label>
                                {formData.schedule.map((item, index) => (
                                    <div key={item.id} style={styles.timeInputContainer}>
                                        <input className="themed-input" style={{...styles.inputShared, ...styles.timeInput}} type="time" value={item.time} onChange={(e) => handleScheduleTimeChange(index, e.target.value)} required />
                                        {formData.schedule.length > 1 && (<button type="button" className="themed-button" style={{...styles.button('danger', 'small'), padding: '8px 12px'}} onClick={() => removeScheduleTimeSlot(index)}>Remove</button>)}
                                    </div>
                                ))}
                                <button type="button" className="themed-button themed-button-secondary" style={{...styles.button('secondary', 'small'), backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', border: `1px solid var(--border-color)`, marginTop: '10px'}} onClick={addScheduleTimeSlot}>+ Add Time</button>
                            </div>
                        )}
                        {formData.frequencyType === 'as_needed' && (
                            <>
                                <div style={styles.formGroup}>
                                    <label style={styles.label} htmlFor="maxDailyDoses">Max Daily Doses (0 for unlimited):</label>
                                    <input className="themed-input" style={styles.inputShared} type="number" id="maxDailyDoses" name="maxDailyDoses" min="0" value={formData.maxDailyDoses} onChange={handleInputChange} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label} htmlFor="prnReason">Reason/Condition for PRN use:</label>
                                    <input className="themed-input" style={styles.inputShared} type="text" id="prnReason" name="prnReason" value={formData.prnReason} onChange={handleInputChange} placeholder="e.g., For panic attacks" />
                                </div>
                            </>
                        )}
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="notes">Notes (optional):</label>
                            <textarea className="themed-textarea" style={{...styles.inputShared, ...styles.textareaShared}} id="notes" name="notes" value={formData.notes} onChange={handleInputChange}></textarea>
                        </div>
                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button type="button" className="themed-button themed-button-secondary" style={{...styles.button('secondary'), backgroundColor: 'transparent', color: 'var(--text-light)', border: `1px solid var(--border-color)`}} onClick={closeModal}>Cancel</button>
                            <button type="submit" className="themed-button" style={styles.button('primary')}>{currentMedication ? 'Update Medication' : 'Add Medication'}</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    if (!userId && !isLoading && !alertModal.isOpen) return (
        <div style={{backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
             <GlobalStyles />
            <div style={{...styles.container, maxWidth: '600px', textAlign: 'center'}}>
                <h1 style={styles.header}>Medication Tracker</h1>
                <p style={{...styles.medicationDetail, fontSize: '1.1rem', color: 'var(--danger-color)'}}>Please log in to use the Medication Tracker.</p>
                {/* You might want a login button here */}
            </div>
            <CustomModal {...alertModal} promptInput={promptValue} setPromptInput={setPromptValue} />
        </div>
    );
    
    if (isLoading && medications.length === 0 && !alertModal.isOpen) return (
        <div style={{backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <GlobalStyles />
            <div style={styles.container}>
                <h1 style={styles.header}>Medication Tracker</h1>
                <LoadingSpinner/>
            </div>
        </div>
    );
    // Inside your MedicationTrackerPage component function

    return (
        <div style={{backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingTop: '1px'}}>
            <GlobalStyles />
            <div style={styles.container}>
                {/* Flex container for Back Button and Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', position: 'relative' }}>
                    <button
                        onClick={handleGoHome}
                        className="themed-button" // Use existing button theming
                        style={{
                            ...styles.button('secondary', 'small'), // Use a secondary style, small size
                            backgroundColor: 'transparent',
                            color: 'var(--primary-color)',
                            padding: '8px 12px',
                            position: 'absolute', // Position it to the left
                            left: '-15px', // Adjust as needed based on container padding
                            top: '50%',
                            transform: 'translateY(-50%)',
                            boxShadow: 'none', // No shadow for a flatter back button
                            border: '1px solid transparent', // Make it look less like a main action
                        }}
                        title="Back to Home" // Tooltip for accessibility
                    >
                        {/* You can use an SVG icon here or text */}
                        ← Home {/* Left arrow HTML entity */}
                    </button>
                    <h1 style={{...styles.header, flexGrow: 1, textAlign: 'center', marginBottom: 0 /* Remove margin if it's inside flex */ }}>Medication Tracker</h1>
                </div>


                <div style={styles.nav}>
                    {/* ... your existing nav buttons ... */}
                    <button
                        style={{
                            ...styles.navButtonBase,
                            ...(view === 'today' ? styles.navButtonActive : styles.navButtonInactive)
                        }}
                        className={`nav-button-actual ${view === 'today' ? 'active' : ''}`}
                        onClick={() => setView('today')}
                    >Today's Doses</button>
                    <button
                        style={{
                            ...styles.navButtonBase,
                            ...(view === 'all' ? styles.navButtonActive : styles.navButtonInactive)
                        }}
                        className={`nav-button-actual ${view === 'all' ? 'active' : ''}`}
                        onClick={() => setView('all')}
                    >All Medications</button>
                </div>
                <style jsx>{`
                    .nav-button-actual {
                        position: relative;
                    }
                    .nav-button-actual.active::after {
                        content: '';
                        position: absolute;
                        bottom: -16px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 60%;
                        height: 3px;
                        background-color: var(--primary-color);
                        border-radius: 2px;
                        transition: width var(--transition-speed-fast) ease;
                    }
                     .nav-button-actual:not(.active):hover::after {
                        content: '';
                        position: absolute;
                        bottom: -16px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 40%;
                        height: 3px;
                        background-color: var(--border-color); /* Lighter underline on hover for inactive */
                        border-radius: 2px;
                        transition: width var(--transition-speed-fast) ease;
                    }
                `}</style>


                <div style={{ marginBottom: '30px', textAlign: 'right' }}>
                    <button className="themed-button" style={styles.button('primary')} onClick={openModalForAdd}>+ Add New Medication</button>
                </div>

                {view === 'today' && memoizedTodayView}
                {view === 'all' && memoizedAllMedicationsView}

                {renderMedicationFormModal()}
                <CustomModal {...alertModal} promptInput={promptValue} setPromptInput={setPromptValue} />
            </div>
        </div>
    );
};

export default MedicationTrackerPage;