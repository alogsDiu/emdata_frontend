// app/[locale]/(dashboard)/health_statistics/summary_page.tsx
"use client"; 

import { useState, useEffect } from 'react';
import styles from './page.module.css'; // ИСПОЛЬЗУЕМ ОТДЕЛЬНЫЙ CSS МОДУЛЬ
import { getLocalizedContent } from '@/lib/i18n';
import { useDashboardContext } from '../DashboardContext'; // Для получения locale

// Определяем структуру данных, ожидаемую от /api/generate-health-summary/
// Она должна совпадать с HealthSummarySerializer на бэкенде
interface HealthSummaryResponseData {
    id: string; // ID сохраненного резюме
    created_at: string; // Дата создания
    symptoms_prompt: string;
    ai_summary: string;
    ai_key_findings: string[]; 
    ai_detailed_breakdown: {
        metricName: string;
        changePercentage: number;
        latestValue: number;
        unit: string;
        llmComment: string; 
    }[];
    ai_suggested_diagnosis: string; // Предложенный диагноз
    is_confirmed: boolean;
    confirmed_diagnosis: string | null;
}

// Определяем структуру контента страницы из i18n
interface SummaryPageContent {
    pageTitle: string;
    symptomsInputLabel: string; // Метка для поля ввода симптомов
    generateButtonText: string; // Текст кнопки генерации
    generatingMessage: string; // Сообщение во время генерации
    overallSummaryTitle: string;
    keyFindingsTitle: string;
    detailedBreakdownTitle: string;
    suggestedDiagnosisTitle: string; // Заголовок для предложенного диагноза
    loadingMessage: string;
    errorMessage: string;
    noDataMessage: string;
    disclaimer: string;
    authenticationRequired: string; // Добавлено
}

// Базовый URL для API-запросов
const API_BASE_URL = process.env.NEXT_PUBLIC_STARTING_BASE || '';
const CLEANED_API_BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;


export default function HealthStatisticsSummaryPage() {
    const { locale } = useDashboardContext(); 
    
    // Состояние для данных резюме (полученных с бэкенда)
    const [summaryData, setSummaryData] = useState<HealthSummaryResponseData | null>(null);
    // Состояние для симптомов, вводимых пользователем
    const [userSymptoms, setUserSymptoms] = useState<string>("");
    // Состояния загрузки и ошибок
    const [isLoading, setIsLoading] = useState(false); // Теперь false по умолчанию
    const [error, setError] = useState<string | null>(null);
    // Состояние для локализованного контента страницы
    const [pageContent, setPageContent] = useState<SummaryPageContent | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);

    // --- Эффект для загрузки локализованного контента страницы ---
    useEffect(() => {
        const fetchPageContent = async () => {
            setIsContentLoading(true);
            setContentError(null);
            try {
                // Ключ 'summary' для файла локализации
                const content = await getLocalizedContent(locale, 'summary') as SummaryPageContent; 
                 if (content) {
                    setPageContent({ // Устанавливаем значения с запасными вариантами
                        pageTitle: content.pageTitle || 'Резюме Здоровья (AI)',
                        symptomsInputLabel: content.symptomsInputLabel || 'Опишите ваши симптомы:',
                        generateButtonText: content.generateButtonText || 'Сгенерировать Резюме',
                        generatingMessage: content.generatingMessage || 'Генерация резюме...',
                        overallSummaryTitle: content.overallSummaryTitle || 'Общее Резюме',
                        keyFindingsTitle: content.keyFindingsTitle || 'Ключевые Выводы',
                        detailedBreakdownTitle: content.detailedBreakdownTitle || 'Детальный Разбор',
                        suggestedDiagnosisTitle: content.suggestedDiagnosisTitle || 'Предполагаемый Диагноз (AI)',
                        loadingMessage: content.loadingMessage || 'Загрузка...',
                        errorMessage: content.errorMessage || 'Не удалось сгенерировать резюме.',
                        noDataMessage: content.noDataMessage || 'Нет данных для отображения резюме.',
                        disclaimer: content.disclaimer || 'Внимание: Это резюме сгенерировано AI и не является медицинским советом. Проконсультируйтесь с врачом.',
                        authenticationRequired: content.authenticationRequired || 'Требуется аутентификация.',
                    });
                 } else {
                    throw new Error("Не удалось загрузить локализованный контент для страницы резюме.");
                 }
            } catch (error: any) {
                console.error("Ошибка загрузки контента страницы резюме:", error);
                setContentError("Не удалось загрузить контент страницы. Отображается текст по умолчанию.");
                 setPageContent({ // Запасной контент
                     pageTitle: 'Резюме Здоровья (AI)',
                     symptomsInputLabel: 'Опишите ваши симптомы:',
                     generateButtonText: 'Сгенерировать Резюме',
                     generatingMessage: 'Генерация резюме...',
                     overallSummaryTitle: 'Общее Резюме',
                     keyFindingsTitle: 'Ключевые Выводы',
                     detailedBreakdownTitle: 'Детальный Разбор',
                     suggestedDiagnosisTitle: 'Предполагаемый Диагноз (AI)',
                     loadingMessage: 'Загрузка...',
                     errorMessage: 'Не удалось сгенерировать резюме.',
                     noDataMessage: 'Нет данных для отображения резюме.',
                     disclaimer: 'Внимание: Это резюме сгенерировано AI и не является медицинским советом. Проконсультируйтесь с врачом.',
                     authenticationRequired: 'Требуется аутентификация.',
                 });
            } finally {
                setIsContentLoading(false);
            }
        };
        fetchPageContent();
    }, [locale]); // Перезагрузка при смене языка

    // --- Функция для отправки запроса на генерацию резюме ---
    const handleGenerateSummary = async () => {
        if (!userSymptoms.trim() || !pageContent) {
            setError(pageContent?.errorMessage || "Пожалуйста, введите симптомы."); // Используем локализованное сообщение, если возможно
            return;
        }

        setIsLoading(true);
        setError(null);
        setSummaryData(null); // Очищаем предыдущее резюме

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError(pageContent.authenticationRequired);
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${CLEANED_API_BASE_URL}/api/generate-health-summary/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symptoms: userSymptoms }), // Отправляем симптомы
            });

            if (!response.ok) {
                let errorDetail = pageContent.errorMessage; // Общее сообщение об ошибке
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.detail || errorData.symptoms || errorDetail; // Пытаемся получить детали ошибки
                } catch (e) {
                    // Не удалось разобрать JSON
                }
                throw new Error(errorDetail);
            }

            const data: HealthSummaryResponseData = await response.json();
            setSummaryData(data); // Сохраняем полученное резюме

        } catch (error: any) {
            console.error("Ошибка генерации резюме:", error);
            setError(error.message || pageContent.errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    // --- Логика Рендеринга ---

    // Состояние загрузки контента страницы
    if (isContentLoading || !pageContent) {
        return (
            <div className={styles.loadingContainer}>
                 <div className={styles.loadingSpinner}></div>
                 <p>{pageContent?.loadingMessage || 'Загрузка...'}</p>
            </div>
        );
    }

    // Ошибка загрузки контента страницы
    if (contentError) {
        return <div className={styles.errorContainer}><p>{contentError}</p></div>;
    }

    // Основной рендеринг
    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>

            {/* Поле ввода симптомов */}
            <div className={styles.inputSection}>
                <label htmlFor="symptomsInput" className={styles.inputLabel}>
                    {pageContent.symptomsInputLabel}
                </label>
                <textarea
                    id="symptomsInput"
                    className={styles.symptomsTextarea}
                    value={userSymptoms}
                    onChange={(e) => setUserSymptoms(e.target.value)}
                    rows={4}
                    placeholder="Например: Головная боль, усталость, температура 37.5..."
                    disabled={isLoading} // Блокируем во время загрузки
                />
                <button 
                    className={styles.generateButton} 
                    onClick={handleGenerateSummary}
                    disabled={isLoading || !userSymptoms.trim()} // Блокируем, если пусто или идет загрузка
                >
                    {isLoading ? pageContent.generatingMessage : pageContent.generateButtonText}
                </button>
            </div>

            {/* Отображение ошибки */}
            {error && <p className={styles.errorMessageApi}>{error}</p>}

            {/* Отображение загрузки */}
            {isLoading && !summaryData && ( // Показываем только если еще нет данных
                 <div className={styles.loadingContainer} style={{marginTop: '20px'}}>
                     <div className={styles.loadingSpinner}></div>
                     <p>{pageContent.generatingMessage}</p>
                 </div>
            )}


            {/* Отображение сгенерированного резюме */}
            {summaryData && (
                <div className={styles.summaryResults}>
                    {/* Общее Резюме */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>{pageContent.overallSummaryTitle}</h2>
                        <p>{summaryData.ai_summary}</p>
                    </section>

                    {/* Ключевые Выводы */}
                    {summaryData.ai_key_findings && summaryData.ai_key_findings.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>{pageContent.keyFindingsTitle}</h2>
                            <ul className={styles.list}>
                                {summaryData.ai_key_findings.map((finding, index) => (
                                    <li key={index} className={styles.listItem}>{finding}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                    
                    {/* Предполагаемый Диагноз */}
                    {summaryData.ai_suggested_diagnosis && (
                         <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>{pageContent.suggestedDiagnosisTitle}</h2>
                            <p className={styles.diagnosisHighlight}>{summaryData.ai_suggested_diagnosis}</p>
                            {/* Здесь в будущем можно добавить кнопку "Подтвердить" */}
                         </section>
                    )}

                    {/* Детальный Разбор */}
                    {summaryData.ai_detailed_breakdown && summaryData.ai_detailed_breakdown.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>{pageContent.detailedBreakdownTitle}</h2>
                            <ul className={styles.list}>
                                {summaryData.ai_detailed_breakdown.map((metric, index) => {
                                    const changePercentageDisplay = typeof metric.changePercentage === 'number'
                                        ? metric.changePercentage.toFixed(1)
                                        : 'N/A';
                                    const changePercentageColor = typeof metric.changePercentage === 'number' && metric.changePercentage >= 0
                                        ? 'green'
                                        : 'red';
                                    return (
                                        <li key={index} className={styles.listItem}>
                                            <strong>{metric.metricName}:</strong> 
                                            {' '}
                                            <span style={{ color: changePercentageColor }}>
                                                ({changePercentageDisplay}%)
                                            </span>
                                            {' '}
                                            (Последнее: {metric.latestValue} {metric.unit})
                                            <br /> {/* Перенос строки для комментария */}
                                            <span className={styles.llmComment}><i>AI: {metric.llmComment}</i></span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}

                    {/* Дисклеймер */}
                    <p className={styles.disclaimer}>{pageContent.disclaimer}</p>
                </div>
            )}
        </div>
    );
}
