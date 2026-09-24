'use client';

import React, { useState, useEffect } from 'react';

interface PlayerProfile {
    name: string;
    auth: string;
}

const STORAGE_KEY = 'sci_fi_player_profile';

export default function SciFiRegistration({ onAuthSuccess }: { onAuthSuccess: (profile: PlayerProfile) => void }) {
    const [step, setStep] = useState<1 | 2>(1);
    const [name, setName] = useState('');
    const [auth, setAuth] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Проверяем localStorage при моннтировании на клиенте
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            onAuthSuccess(JSON.parse(saved));
        } else {
            setIsVisible(true);
        }
    }, [onAuthSuccess]);

    if (!isVisible) return null;

    const handleNext = () => {
        if (!name.trim()) {
            alert('Поле имени не может быть пустым!');
            return;
        }
        setStep(2);
    };

    const handleComplete = () => {
        if (!auth.trim()) {
            alert('Введите аутентификатор!');
            return;
        }
        const profile: PlayerProfile = { name: name.trim(), auth: auth.trim() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        setIsVisible(false);
        onAuthSuccess(profile);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.box}>
                <div style={styles.header}>
                    <div style={styles.icon}>!</div>
                    <div style={styles.title}>NOTIFICATION // REGISTRATION</div>
                </div>

                {step === 1 ? (
                    <div>
                        <div style={styles.text}>
                            [Идентификация личности]<br />
                            «Здравствуйте, Игрок. Введите своё имя.»
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            placeholder="Введите имя..."
                        />
                        <button onClick={handleNext} style={styles.btn}>ДАЛЕЕ</button>
                    </div>
                ) : (
                    <div>
                        <div style={styles.text}>
                            [Безопасность системы]<br />
                            «Введите персональный аутентификатор (код/ID).»
                        </div>
                        <input
                            type="text"
                            value={auth}
                            onChange={(e) => setAuth(e.target.value)}
                            style={styles.input}
                            placeholder="AUTH-ID-XXXX..."
                        />
                        <button onClick={handleComplete} style={styles.btn}>ПОДТВЕРДИТЬ</button>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 5, 15, 0.85)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
        fontFamily: "'Share Tech Mono', monospace"
    },
    box: {
        width: '480px', padding: '25px',
        background: 'rgba(3, 10, 25, 0.95)',
        border: '2px solid #00f3ff',
        boxShadow: '0 0 30px rgba(0, 243, 255, 0.4), inset 0 0 15px rgba(0, 243, 255, 0.2)',
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
        color: '#00f3ff'
    },
    header: {
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid #00f3ff', paddingBottom: '10px', marginBottom: '20px'
    },
    icon: {
        width: '28px', height: '28px', border: '1.5px solid #00f3ff',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        marginRight: '12px', fontWeight: 'bold', boxShadow: '0 0 8px #00f3ff'
    },
    title: { fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' },
    text: { fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px', color: '#b0e0e6' },
    input: {
        width: '100%', boxSizing: 'border-box', background: 'rgba(0, 243, 255, 0.05)',
        border: '1px solid #00f3ff', color: '#00f3ff', padding: '12px',
        fontFamily: 'inherit', fontSize: '1rem', marginBottom: '20px', outline: 'none'
    },
    btn: {
        display: 'block', margin: '0 auto', background: 'rgba(0, 243, 255, 0.1)',
        border: '1px solid #00f3ff', color: '#00f3ff', padding: '10px 30px',
        fontFamily: 'inherit', cursor: 'pointer', letterSpacing: '1.5px', textTransform: 'uppercase'
    }
};