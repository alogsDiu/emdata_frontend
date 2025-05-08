// app/[locale]/(dashboard)/health_statistics/page.tsx
"use client"; 

import { useState, useEffect, useMemo, Fragment } from 'react'; // Added Fragment
import styles from './page.module.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardContext } from '../DashboardContext';
import { getLocalizedContent } from '@/lib/i18n';
import { format, Locale as DateFnsLocale } from 'date-fns'; // Renamed Locale to DateFnsLocale
import { enUS, ru, kk } from 'date-fns/locale';

// --- Интерфейсы для данных статистики (остаются без изменений) ---
interface MetricHistoryPoint {
    date: string; 
    value: number;
}

interface MetricData {
    name_of_component: string;
    name_of_unit: string;
    percentage_of_change: number;
    list_of_all_the_values: MetricHistoryPoint[];
}

type HealthStatsData = MetricData[];

interface ChartDataPoint {
    date: string;
    [key: string]: number | string;
}

interface DisplayMetricChange {
    metricName: string;
    unit: string;
    latestValue: number;
    percentage_of_change: number | null;
}

interface DisplayAllChange {
    metricName: string;
    unit: string;
    latestValue: number;
    previousValue: number | null;
    percentage_of_change: number;
}

// --- Интерфейс для данных одной сводки здоровья (из all_summaries_page) ---
interface HealthSummaryResponseData {
    id: string;
    created_at: string;
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
    ai_suggested_diagnosis: string;
    is_confirmed: boolean;
    confirmed_diagnosis: string | null;
}


// --- ОБНОВЛЕННЫЙ ИНТЕРФЕЙС для локализованного контента страницы ---
// Включает ключи для статистики И для списка сводок
interface HealthStatisticsPageContent {
    loadingMessage: string;
    // Статистика
    pageTitle: string;
    trendsTitle: string;
    chartsPlaceholder: string;
    mostChangeTitle: string;
    changeLabel: string;
    noStatsDataMessage: string;
    allChangesTitle: string;
    selectMetricsLabel: string;
    authenticationRequired: string; // Общий для обеих секций

    // Список сводок (ключи из AllSummariesPageContent)
    summariesSectionTitle?: string; // Новый заголовок для секции сводок
    loadingSummariesMessage?: string;
    errorLoadingSummariesMessage?: string;
    noSummariesMessage?: string;
    summaryCardTitle?: string;
    overallSummaryTitle?: string;
    keyFindingsTitle?: string;
    detailedBreakdownTitle?: string;
    suggestedDiagnosisTitle?: string;
    symptomsPromptTitle?: string;
    disclaimer?: string; // Общий дисклеймер или специфичный для сводок
    viewDetailsButton?: string;
    hideDetailsButton?: string;
    confirmAIDiagnosisButton?: string;
    markAsConfirmedButton?: string;
    confirmedStatusText?: string;
    confirmingMessage?: string;
    enterDiagnosisPromptTitle?: string;
    diagnosisInputLabel?: string;
    submitConfirmationButton?: string;
    cancelButton?: string;
    errorConfirmingDiagnosis?: string;
    aiDiagnosisMissingError?: string;
}


const API_BASE_URL = process.env.NEXT_PUBLIC_STARTING_BASE || '';
const CLEANED_API_BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;


export default function HealthStatisticsPage() {
    const { locale } = useDashboardContext();
    const [pageContent, setPageContent] = useState<HealthStatisticsPageContent | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);

    // Состояния для данных статистики
    const [healthStats, setHealthStats] = useState<HealthStatsData | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [selectedMetricsForChart, setSelectedMetricsForChart] = useState<string[]>([]);

    // Состояния для списка сводок
    const [summariesData, setSummariesData] = useState<HealthSummaryResponseData[] | null>(null);
    const [isLoadingSummaries, setIsLoadingSummaries] = useState(true);
    const [summariesError, setSummariesError] = useState<string | null>(null);
    const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);
    const [currentDateLocale, setCurrentDateLocale] = useState<DateFnsLocale>(enUS);
    const [confirmingSummaryId, setConfirmingSummaryId] = useState<string | null>(null);
    const [confirmationError, setConfirmationError] = useState<string | null>(null);


    // Эффект для загрузки локализованного контента страницы и установки локали для дат
    useEffect(() => {
        const loadContentAndDateLocale = async () => {
            setIsContentLoading(true);
            setContentError(null);
            try {
                // Предполагаем, что health_statistics.json теперь содержит ВСЕ ключи
                const content = await getLocalizedContent(locale, 'health_statistics') as HealthStatisticsPageContent;
                if (content) {
                    setPageContent({
                        // Статистика
                        pageTitle: content.pageTitle || 'Статистика и Сводки Здоровья', // Обновленный заголовок
                        trendsTitle: content.trendsTitle || 'Тренды Здоровья',
                        chartsPlaceholder: content.chartsPlaceholder || 'Выберите метрики для отображения графиков.',
                        mostChangeTitle: content.mostChangeTitle || 'Наиболее Значимое Изменение',
                        changeLabel: content.changeLabel || 'Изменение:',
                        noStatsDataMessage: content.noStatsDataMessage || 'Данные статистики здоровья отсутствуют.',
                        allChangesTitle: content.allChangesTitle || 'Все Изменения',
                        selectMetricsLabel: content.selectMetricsLabel || 'Выберите Метрики для Графика:',
                        authenticationRequired: content.authenticationRequired || 'Требуется аутентификация.',
                        loadingMessage : content.loadingMessage || 'Загрузка данных статистики здоровья...',
                        // Список сводок
                        summariesSectionTitle: content.summariesSectionTitle || 'Мои Сводки Здоровья',
                        loadingSummariesMessage: content.loadingSummariesMessage || 'Загрузка сводок...',
                        errorLoadingSummariesMessage: content.errorLoadingSummariesMessage || 'Не удалось загрузить сводки.',
                        noSummariesMessage: content.noSummariesMessage || 'Сводки здоровья отсутствуют.',
                        summaryCardTitle: content.summaryCardTitle || 'Сводка от {date}',
                        overallSummaryTitle: content.overallSummaryTitle || 'Общая Сводка',
                        keyFindingsTitle: content.keyFindingsTitle || 'Ключевые Выводы',
                        detailedBreakdownTitle: content.detailedBreakdownTitle || 'Детальный Разбор',
                        suggestedDiagnosisTitle: content.suggestedDiagnosisTitle || 'Предполагаемый Диагноз (ИИ)',
                        symptomsPromptTitle: content.symptomsPromptTitle || 'Указанные Симптомы',
                        disclaimer: content.disclaimer || 'Внимание: Информация сгенерирована ИИ и не является медицинским советом. Проконсультируйтесь с врачом.',
                        viewDetailsButton: content.viewDetailsButton || "Подробнее",
                        hideDetailsButton: content.hideDetailsButton || "Скрыть",
                        confirmAIDiagnosisButton: content.confirmAIDiagnosisButton || "Подтвердить диагноз ИИ",
                        markAsConfirmedButton: content.markAsConfirmedButton || "Отметить как подтвержденный",
                        confirmedStatusText: content.confirmedStatusText || "Диагноз подтвержден",
                        confirmingMessage: content.confirmingMessage || "Подтверждение...",
                        enterDiagnosisPromptTitle: content.enterDiagnosisPromptTitle || "Подтвердить диагноз",
                        diagnosisInputLabel: content.diagnosisInputLabel || "Подтвержденный диагноз:",
                        submitConfirmationButton: content.submitConfirmationButton || "Подтвердить",
                        cancelButton: content.cancelButton || "Отмена",
                        errorConfirmingDiagnosis: content.errorConfirmingDiagnosis || "Ошибка подтверждения диагноза.",
                        aiDiagnosisMissingError: content.aiDiagnosisMissingError || "Диагноз ИИ отсутствует.",
                    });
                } else {
                    throw new Error("Не удалось загрузить локализованный контент.");
                }

                if (locale === 'kk') setCurrentDateLocale(kk);
                else if (locale === 'ru') setCurrentDateLocale(ru);
                else setCurrentDateLocale(enUS);

            } catch (err: any) {
                console.error("Ошибка загрузки контента страницы:", err);
                setContentError("Не удалось загрузить контент страницы. Отображается текст по умолчанию.");
                setPageContent({ /* ... fallback content with all keys ... */ } as HealthStatisticsPageContent); // Provide full fallback
                setCurrentDateLocale(enUS);
            } finally {
                setIsContentLoading(false);
            }
        };
        loadContentAndDateLocale();
    }, [locale]);

    // Эффект для загрузки данных СТАТИСТИКИ ЗДОРОВЬЯ
    useEffect(() => {
        if (!pageContent || isContentLoading) return; 
        
        const fetchHealthData = async () => {
            setIsLoadingStats(true);
            setStatsError(null);
            setHealthStats(null); // Reset before fetching
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setStatsError(pageContent.authenticationRequired);
                    return;
                }
                const response = await fetch(`${CLEANED_API_BASE_URL}/api/health-statistics/`, {
                    headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
                });
                if (!response.ok) {
                    let errorDetail = `Ошибка ${response.status}.`;
                    try { const d = await response.json(); errorDetail = d.detail || d.message || errorDetail; } catch(e){}
                    throw new Error(errorDetail);
                }
                const data: HealthStatsData = await response.json();
                setHealthStats(data);
            } catch (error: any) {
                setStatsError(error.message || pageContent.noStatsDataMessage); 
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchHealthData();
    }, [pageContent, isContentLoading]); // Depend on pageContent and its loading state

    // Эффект для загрузки СПИСКА СВОДОК
    useEffect(() => {
        if (!pageContent || isContentLoading) return;

        const fetchSummaries = async () => {
            setIsLoadingSummaries(true);
            setSummariesError(null);
            setSummariesData(null); // Reset before fetching
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setSummariesError(pageContent.authenticationRequired);
                    return;
                }
                const response = await fetch(`${CLEANED_API_BASE_URL}/api/health-summaries/`, {
                    headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
                });
                if (!response.ok) {
                    let errorDetail = pageContent.errorLoadingSummariesMessage || `Ошибка ${response.status}.`;
                    try{ const d = await response.json(); errorDetail = d.detail || errorDetail; } catch(e){}
                    throw new Error(errorDetail);
                }
                const data: HealthSummaryResponseData[] = await response.json();
                setSummariesData(data);
            } catch (error: any) {
                setSummariesError(error.message || pageContent.errorLoadingSummariesMessage);
            } finally {
                setIsLoadingSummaries(false);
            }
        };
        fetchSummaries();
    }, [pageContent, isContentLoading]);


    // --- Функции для списка сводок ---
    const toggleSummaryDetails = (summaryId: string) => {
        setExpandedSummaryId(prevId => prevId === summaryId ? null : summaryId);
    };

    const handleConfirmAIDiagnosis = async (summary: HealthSummaryResponseData) => {
        if (!pageContent) return;
        if (!summary.ai_suggested_diagnosis) {
            setConfirmationError(pageContent.aiDiagnosisMissingError || "Диагноз ИИ отсутствует.");
            return;
        }
        setConfirmingSummaryId(summary.id);
        setConfirmationError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setConfirmationError(pageContent.authenticationRequired); return;
            }
            const response = await fetch(`${CLEANED_API_BASE_URL}/api/health-summaries/${summary.id}/confirm/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirmed_diagnosis: summary.ai_suggested_diagnosis }),
            });
            if (!response.ok) {
                let errorDetail = pageContent.errorConfirmingDiagnosis;
                try { const d=await response.json();errorDetail=d.detail||(d.confirmed_diagnosis?d.confirmed_diagnosis[0]:null)||errorDetail;}catch(e){}
                throw new Error(errorDetail);
            }
            const updatedSummary: HealthSummaryResponseData = await response.json();
            setSummariesData(prev => prev ? prev.map(s => s.id === updatedSummary.id ? updatedSummary : s) : null);
        } catch (error: any) {
            setConfirmationError(error.message || pageContent.errorConfirmingDiagnosis);
        } finally {
            setConfirmingSummaryId(null);
        }
    };

    // --- Обработка данных статистики (мемоизированная) ---
    const processedData = useMemo(() => {
        // ... (логика из вашего health_statistics/page.tsx остается здесь) ...
        const metricsData = healthStats;
        if (!metricsData || metricsData.length === 0) {
            return { chartData: [], allChanges: [], mostChangedMetric: null, individualMetricData: {} };
        }
        const dateMap = new Map<string, ChartDataPoint>();
        metricsData.forEach(metric => {
            if (metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0) {
                metric.list_of_all_the_values.forEach(historyPoint => {
                    const dateKey = historyPoint.date;
                    if (!dateMap.has(dateKey)) dateMap.set(dateKey, { date: dateKey });
                    dateMap.get(dateKey)![metric.name_of_component] = historyPoint.value;
                });
            }
        });
        const processedChartData: ChartDataPoint[] = Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const individualMetricData: { [key: string]: ChartDataPoint[] } = {};
        metricsData.forEach(metric => {
            if (metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0) {
                const sortedHistory = metric.list_of_all_the_values.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                individualMetricData[metric.name_of_component] = sortedHistory.map(point => ({
                    date: point.date,
                    [metric.name_of_component]: point.value
                }));
            }
        });
        const allChangesList: DisplayAllChange[] = [];
        let mostChanged: DisplayMetricChange | null = null;
        let maxAbsoluteChangePercentage = -1;
        metricsData.forEach(metric => {
            if (typeof metric.percentage_of_change === 'number' && metric.list_of_all_the_values && metric.list_of_all_the_values.length >= 1) {
                const latestHistoryPoint = metric.list_of_all_the_values[metric.list_of_all_the_values.length - 1];
                const previousHistoryPoint = metric.list_of_all_the_values.length >= 2 ? metric.list_of_all_the_values[metric.list_of_all_the_values.length - 2] : null;
                allChangesList.push({
                    metricName: metric.name_of_component,
                    unit: metric.name_of_unit,
                    latestValue: latestHistoryPoint.value,
                    previousValue: previousHistoryPoint ? previousHistoryPoint.value : null,
                    percentage_of_change: metric.percentage_of_change,
                });
                const absolutePercentage = Math.abs(metric.percentage_of_change);
                if (absolutePercentage > maxAbsoluteChangePercentage) {
                    maxAbsoluteChangePercentage = absolutePercentage;
                    mostChanged = {
                        metricName: metric.name_of_component,
                        unit: metric.name_of_unit,
                        latestValue: latestHistoryPoint.value,
                        percentage_of_change: metric.percentage_of_change,
                    };
                }
            }
        });
        return { chartData: processedChartData, allChanges: allChangesList, mostChangedMetric: mostChanged, individualMetricData: individualMetricData };
    }, [healthStats]);

    const { allChanges, mostChangedMetric, individualMetricData } = processedData;

     useEffect(() => {
        if (healthStats && healthStats.length > 0) {
            const allMetricNames = healthStats
                .filter(metric => metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0)
                .map(metric => metric.name_of_component);
            // Initialize with all metrics selected, or based on some other logic (e.g., top N)
            setSelectedMetricsForChart(allMetricNames.slice(0, 3)); // Example: select first 3 by default
        } else {
            setSelectedMetricsForChart([]);
        }
    }, [healthStats]); // Re-run when healthStats data is available

    const handleMetricSelection = (metricName: string, isSelected: boolean) => {
        setSelectedMetricsForChart(prevSelected => {
            if (isSelected) {
                if (!prevSelected.includes(metricName)) return [...prevSelected, metricName];
            } else {
                return prevSelected.filter(name => name !== metricName);
            }
            return prevSelected;
        });
    };

    // --- Логика Рендеринга ---
    if (isContentLoading || !pageContent) {
        return <div className={styles.loadingPageContainer}><div className={styles.loadingSpinner}></div> <p>{pageContent?.loadingMessage || "Загрузка..."}</p></div>;
    }
    
    // Рендеринг секции статистики
    const renderStatisticsSection = () => {
        if (isLoadingStats) {
            return <div className={styles.loadingSectionContainer}><div className={styles.loadingSpinner}></div> <p>{pageContent.loadingMessage}</p></div>;
        }
        if (statsError) {
            return <p className={styles.errorMessage}>{statsError}</p>;
        }
        const hasAnyDataPoints = healthStats?.some(metric => metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0);
        if (!healthStats || healthStats.length === 0 || !hasAnyDataPoints) {
            return <p>{pageContent.noStatsDataMessage}</p>;
        }

        const renderMostChangedMetric = () => {
            if (mostChangedMetric && pageContent) {
                const { metricName, unit, latestValue, percentage_of_change } = mostChangedMetric;
                const percentageDisplay = typeof (percentage_of_change as number) === 'number' ? (percentage_of_change as number).toFixed(1) : 'N/A';
                const percentageColor = typeof percentage_of_change === 'number' && percentage_of_change >= 0 ? 'green' : 'red';
                return (
                    <div className={styles.statsSection}>
                        <h2 className={styles.sectionTitle}>{pageContent.mostChangeTitle}</h2>
                        <div className={styles.mostChangeHighlight}>
                            <p><strong>{metricName}</strong>: {pageContent.changeLabel} <span style={{ color: percentageColor, fontWeight: 'bold' }}>{percentageDisplay}%</span> (Последнее: {latestValue} {unit})</p>
                        </div>
                    </div>
                );
            }
            return null;
        };

        return (
            <>
                {renderMostChangedMetric()}
                {allChanges.length > 0 && (
                     <div className={styles.statsSection}>
                         <h2 className={styles.sectionTitle}>{pageContent.allChangesTitle}</h2>
                         <ul className={styles.changesList}>
                             {allChanges.map(change => {
                                 const changePercentageDisplay = typeof change.percentage_of_change === 'number' ? change.percentage_of_change.toFixed(1) : 'N/A';
                                 const changePercentageColor = typeof change.percentage_of_change === 'number' && change.percentage_of_change >= 0 ? 'green' : 'red';
                                 return (
                                     <li key={change.metricName} className={styles.changeItem}>
                                         <strong>{change.metricName}:</strong> {pageContent.changeLabel} <span style={{ color: changePercentageColor, fontWeight: 'bold' }}>{changePercentageDisplay}%</span> (Последнее: {change.latestValue} {change.unit}, Предыдущее: {change.previousValue !== null ? `${change.previousValue} ${change.unit}` : 'Н/Д'})
                                     </li>
                                 );
                             })}
                         </ul>
                     </div>
                 )}
                <div className={styles.statsSection}>
                    <h2 className={styles.sectionTitle}>{pageContent.trendsTitle}</h2>
                    {healthStats && healthStats.length > 0 && (
                        <div className={styles.metricSelectionControls}>
                            <label className={styles.groupLabel}>{pageContent.selectMetricsLabel}</label>
                            <div className={styles.checkboxGroup}>
                                {healthStats.filter(m => m.list_of_all_the_values && m.list_of_all_the_values.length > 0).map(metric => (
                                    <label key={metric.name_of_component} className={styles.metricCheckboxLabel}>
                                        <input type="checkbox" value={metric.name_of_component} checked={selectedMetricsForChart.includes(metric.name_of_component)} onChange={(e) => handleMetricSelection(metric.name_of_component, e.target.checked)} />
                                        <span className={styles.customCheckbox}></span>
                                        <span className={styles.metricNameText}>{metric.name_of_component}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    {selectedMetricsForChart.length > 0 ? (
                        <div className={styles.chartsArea}>
                            {selectedMetricsForChart.map((metricName, index) => {
                                const metricChartData = individualMetricData[metricName];
                                const originalMetric = healthStats?.find(m => m.name_of_component === metricName);
                                if (metricChartData && metricChartData.length >= 1) {
                                    return (
                                        <div key={metricName} className={styles.individualChartContainer}>
                                            <h3 className={styles.chartTitle}>{metricName} ({originalMetric?.name_of_unit})</h3>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <LineChart data={metricChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis domain={['auto', 'auto']} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey={metricName} stroke={['#8884d8', '#82ca9d', '#ffc658', '#a4dee3', '#f45b69', '#b072d1'][index % 6]} activeDot={{ r: 8 }} name={`${metricName} (${originalMetric?.name_of_unit})`} unit={originalMetric?.name_of_unit} connectNulls={true} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={metricName} className={styles.individualChartContainer}>
                                        <h3 className={styles.chartTitle}>{metricName} ({originalMetric?.name_of_unit})</h3>
                                        <p>Недостаточно данных для {metricName}.</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (<p>{pageContent.chartsPlaceholder}</p>)}
                </div>
            </>
        );
    };

    // Рендеринг секции списка сводок
    const renderSummariesSection = () => {
        if (isLoadingSummaries) {
            return <div className={styles.loadingSectionContainer}><div className={styles.loadingSpinner}></div> <p>{pageContent.loadingSummariesMessage}</p></div>;
        }
        if (summariesError) {
            return <p className={styles.errorMessage}>{summariesError}</p>;
        }
        if (!summariesData || summariesData.length === 0) {
            return <p>{pageContent.noSummariesMessage}</p>;
        }

        return (
            <div className={styles.summariesList}> {/* Используйте класс из all_summaries_page.module.css или определите новый */}
                {confirmationError && <p className={`${styles.errorMessage} ${styles.confirmationError}`}>{confirmationError}</p>}
                {summariesData.map((summary) => (
                    <div key={summary.id} className={styles.summaryCard}> {/* Стиль из all_summaries_page.module.css */}
                        <h3 className={styles.summaryCardTitle}>
                            {pageContent.summaryCardTitle?.replace('{date}', format(new Date(summary.created_at), 'PPP p', { locale: currentDateLocale }))}
                        </h3>
                        <p className={styles.summaryExcerpt}>
                            <strong>{pageContent.suggestedDiagnosisTitle}:</strong> {summary.ai_suggested_diagnosis || "N/A"}
                            <br />
                            <i>{summary.ai_summary.substring(0, 150)}{summary.ai_summary.length > 150 ? "..." : ""}</i>
                        </p>
                        
                        <div className={styles.confirmationSection}> {/* Стиль из all_summaries_page.module.css */}
                            {!summary.is_confirmed && summary.ai_suggested_diagnosis && (
                                <button
                                    onClick={() => handleConfirmAIDiagnosis(summary)}
                                    className={styles.confirmButton} // Стиль из all_summaries_page.module.css
                                    disabled={confirmingSummaryId === summary.id}
                                >
                                    {confirmingSummaryId === summary.id ? pageContent.confirmingMessage : pageContent.confirmAIDiagnosisButton}
                                </button>
                            )}
                            {summary.is_confirmed && (
                                <p className={styles.confirmedStatus}> {/* Стиль из all_summaries_page.module.css */}
                                    {pageContent.confirmedStatusText}: {summary.confirmed_diagnosis}
                                </p>
                            )}
                            {!summary.is_confirmed && !summary.ai_suggested_diagnosis && (
                                <p className={styles.aiDiagnosisMissingText}>{pageContent.aiDiagnosisMissingError}</p>
                            )}
                        </div>

                        <button
                            onClick={() => toggleSummaryDetails(summary.id)}
                            className={styles.toggleDetailsButton} // Стиль из all_summaries_page.module.css
                            style={{marginTop: "10px"}}
                        >
                            {expandedSummaryId === summary.id ? pageContent.hideDetailsButton : pageContent.viewDetailsButton}
                        </button>

                        {expandedSummaryId === summary.id && (
                            <div className={styles.summaryDetails}> {/* Стиль из all_summaries_page.module.css */}
                                <section className={styles.section}>
                                    <h4 className={styles.sectionTitle}>{pageContent.symptomsPromptTitle}</h4>
                                    <p className={styles.symptomsText}>{summary.symptoms_prompt}</p>
                                </section>
                                <section className={styles.section}>
                                    <h4 className={styles.sectionTitle}>{pageContent.overallSummaryTitle}</h4>
                                    <p>{summary.ai_summary}</p>
                                </section>
                                {summary.ai_key_findings && summary.ai_key_findings.length > 0 && (
                                    <section className={styles.section}>
                                        <h4 className={styles.sectionTitle}>{pageContent.keyFindingsTitle}</h4>
                                        <ul className={styles.list}>
                                            {summary.ai_key_findings.map((f, i) => <li key={i} className={styles.listItem}>{f}</li>)}
                                        </ul>
                                    </section>
                                )}
                                {summary.ai_suggested_diagnosis && (
                                    <section className={styles.section}>
                                        <h4 className={styles.sectionTitle}>{pageContent.suggestedDiagnosisTitle}</h4>
                                        <p className={styles.diagnosisHighlight}>{summary.ai_suggested_diagnosis}</p>
                                    </section>
                                )}
                                {summary.is_confirmed && summary.confirmed_diagnosis && (
                                     <section className={styles.section} style={{backgroundColor: "#e6f7ff", borderColor: "#91d5ff"}}>
                                        <h4 className={styles.sectionTitle} style={{color: "#0050b3"}}>{pageContent.confirmedStatusText}</h4>
                                        <p className={styles.diagnosisHighlightConfirmed}>{summary.confirmed_diagnosis}</p>
                                    </section>
                                )}
                                {summary.ai_detailed_breakdown && summary.ai_detailed_breakdown.length > 0 && (
                                    <section className={styles.section}>
                                        <h4 className={styles.sectionTitle}>{pageContent.detailedBreakdownTitle}</h4>
                                        <ul className={styles.list}>
                                            {summary.ai_detailed_breakdown.map((m, i) => {
                                                const pcD = typeof m.changePercentage === 'number' ? m.changePercentage.toFixed(1) : 'N/A';
                                                const pcC = typeof m.changePercentage === 'number' ? (m.changePercentage > 0 ? 'green':(m.changePercentage < 0 ? 'red':'grey')):'grey';
                                                return <li key={i} className={styles.listItem}><strong>{m.metricName}:</strong> <span style={{color:pcC}}>({pcD}%)</span> (Последнее: {m.latestValue} {m.unit})<br/><span className={styles.llmComment}><i>AI: {m.llmComment}</i></span></li>;
                                            })}
                                        </ul>
                                    </section>
                                )}
                                <p className={styles.disclaimer}>{pageContent.disclaimer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };


    // --- Основной Рендеринг Компонента ---
    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>
            
            {/* Секция Статистики */}
            {renderStatisticsSection()}

            {/* Секция Списка Сводок */}
            <div className={styles.statsSection} style={{marginTop: "40px"}}> {/* Добавляем отступ */}
                <h2 className={styles.sectionTitle}>{pageContent.summariesSectionTitle}</h2>
                {renderSummariesSection()}
            </div>
            
            {/* Общий дисклеймер страницы */}
            {!isContentLoading && pageContent && pageContent.disclaimer && (
                 <p className={`${styles.disclaimer} ${styles.pageFooterDisclaimer}`}>{pageContent.disclaimer}</p>
            )}
        </div>
    );
}
