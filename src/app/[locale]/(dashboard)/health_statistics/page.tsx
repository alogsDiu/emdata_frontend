// app/[locale]/(dashboard)/health_statistics/page.tsx
"use client"; 

import { useState, useEffect, useMemo } from 'react';
import styles from './page.module.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardContext } from '../DashboardContext';
import { getLocalizedContent } from '@/lib/i18n';

// Определяем ожидаемую структуру контента для health_statistics.json
interface HealthStatisticsPageContent {
    pageTitle: string;
    trendsTitle: string;
    chartsPlaceholder: string;
    mostChangeTitle: string;
    changeLabel: string;
    noStatsDataMessage: string;
    allChangesTitle: string;
    selectMetricsLabel: string;
    authenticationRequired: string;
}

// Интерфейс для одной исторической точки данных
interface MetricHistoryPoint {
    date: string; 
    value: number;
}

// Интерфейс для данных одной метрики с бэкенда
interface MetricData {
    name_of_component: string;
    name_of_unit: string;
    percentage_of_change: number;
    list_of_all_the_values: MetricHistoryPoint[];
}

// Тип для структуры данных статистики здоровья
type HealthStatsData = MetricData[];

// Тип для обработанных данных для диаграмм
interface ChartDataPoint {
    date: string;
    [key: string]: number | string; // Динамические ключи для метрик
}

// Тип для отображения наиболее изменившейся метрики
interface DisplayMetricChange {
    metricName: string;
    unit: string;
    latestValue: number;
    percentage_of_change: number | null;
}

// Тип для отображения всех изменений
interface DisplayAllChange {
    metricName: string;
    unit: string;
    latestValue: number;
    previousValue: number | null;
    percentage_of_change: number;
}

// Базовый URL для API-запросов
const API_BASE_URL = process.env.NEXT_PUBLIC_STARTING_BASE || '';
const CLEANED_API_BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;


export default function HealthStatisticsPage() {
    const { locale } = useDashboardContext();
    const [pageContent, setPageContent] = useState<HealthStatisticsPageContent | null>(null);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);

    const [healthStats, setHealthStats] = useState<HealthStatsData | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [selectedMetricsForChart, setSelectedMetricsForChart] = useState<string[]>([]);

    // Эффект для загрузки локализованного контента страницы
    useEffect(() => {
        const fetchPageContent = async () => {
            setIsContentLoading(true);
            setContentError(null);
            try {
                const content = await getLocalizedContent(locale, 'health_statistics') as HealthStatisticsPageContent;
                 if (content) {
                    setPageContent({
                        pageTitle: content.pageTitle || 'Статистика Здоровья',
                        trendsTitle: content.trendsTitle || 'Тренды Здоровья',
                        chartsPlaceholder: content.chartsPlaceholder || 'Выберите метрики для отображения графиков.',
                        mostChangeTitle: content.mostChangeTitle || 'Наиболее Значимое Изменение',
                        changeLabel: content.changeLabel || 'Изменение:',
                        noStatsDataMessage: content.noStatsDataMessage || 'Данные статистики здоровья отсутствуют.',
                        allChangesTitle: content.allChangesTitle || 'Все Изменения',
                        selectMetricsLabel: content.selectMetricsLabel || 'Выберите Метрики для Графика:',
                        authenticationRequired: content.authenticationRequired || 'Для просмотра статистики требуется аутентификация.',
                    });
                 } else {
                    throw new Error("Не удалось загрузить локализованный контент для статистики здоровья.");
                 }
            } catch (error: any) {
                console.error("Ошибка загрузки контента страницы:", error);
                setContentError("Не удалось загрузить контент страницы. Отображается текст по умолчанию.");
                 setPageContent({
                     pageTitle: 'Статистика Здоровья',
                     trendsTitle: 'Тренды Здоровья',
                     chartsPlaceholder: 'Выберите метрики для отображения графиков.',
                     mostChangeTitle: 'Наиболее Значимое Изменение',
                     changeLabel: 'Изменение:',
                     noStatsDataMessage: 'Данные статистики здоровья отсутствуют. Загрузите документ, чтобы увидеть свою статистику.',
                     allChangesTitle: 'Все Изменения',
                     selectMetricsLabel: 'Выберите Метрики для Графика:',
                     authenticationRequired: 'Для просмотра статистики требуется аутентификация.',
                 });
            } finally {
                setIsContentLoading(false);
            }
        };
        fetchPageContent();
    }, [locale]);

    // Эффект для загрузки данных СТАТИСТИКИ ЗДОРОВЬЯ с API
    useEffect(() => {
        if (!pageContent) {
            return; 
        }
        setIsLoadingStats(true);
        setStatsError(null);
        setHealthStats(null);

        const fetchHealthData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setStatsError(pageContent.authenticationRequired);
                    setIsLoadingStats(false);
                    return;
                }
                const response = await fetch(`${CLEANED_API_BASE_URL}/api/health-statistics/`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    let errorDetail = `Ошибка ${response.status}: Не удалось загрузить статистику здоровья.`;
                    try {
                        const errorData = await response.json();
                        errorDetail = errorData.detail || errorData.message || errorDetail;
                    } catch (e) {}
                    throw new Error(errorDetail);
                }
                const data: HealthStatsData = await response.json();
                setHealthStats(data);
            } catch (error: any) {
                console.error("Ошибка загрузки статистики здоровья:", error);
                setStatsError(error.message || pageContent.noStatsDataMessage); 
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchHealthData();
    }, [locale, pageContent]);

    // Обработка данных статистики здоровья (мемоизированная)
    const processedData = useMemo(() => {
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

    // Эффект для инициализации selectedMetricsForChart
    useEffect(() => {
        if (healthStats && healthStats.length > 0) {
            const allMetricNames = healthStats
                .filter(metric => metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0)
                .map(metric => metric.name_of_component);
            setSelectedMetricsForChart(allMetricNames);
        } else {
            setSelectedMetricsForChart([]);
        }
    }, [healthStats]);

    // Обработчик для чекбоксов выбора метрик
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
        return <div className={styles.loadingPageContainer}><div className={styles.loadingSpinner}></div></div>;
    }
    if (isLoadingStats) {
        return (
            <div className={styles.pageContainer}>
                 <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>
                <div className={styles.loadingPageContainer} style={{height: '200px'}}><div className={styles.loadingSpinner}></div></div>
            </div>
        );
    }
    if (statsError) {
         return (
            <div className={styles.pageContainer}>
                 <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>
                 <p className={styles.errorMessage}>{statsError}</p>
            </div>
        );
    }
    const hasAnyDataPoints = healthStats?.some(metric => metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0);
    if (!healthStats || healthStats.length === 0 || !hasAnyDataPoints) {
        return (
            <div className={styles.pageContainer}>
                 <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>
                 <p>{pageContent.noStatsDataMessage}</p>
            </div>
        );
    }

    // Функция для рендеринга секции "Наиболее Значимое Изменение"
    const renderMostChangedMetric = () => {
        if (mostChangedMetric && pageContent) {
            const { metricName, unit, latestValue, percentage_of_change } = mostChangedMetric;

            // ИСПРАВЛЕНО: Явная проверка типа перед использованием .toFixed()
            const percentageDisplay = typeof (percentage_of_change as number) === 'number'
    ? (percentage_of_change as number).toFixed(1)
    : 'N/A';
            // Определяем цвет на основе числового значения, если оно есть
            const percentageColor = typeof percentage_of_change === 'number' && percentage_of_change >= 0 
                ? 'green' 
                : 'red';

            return (
                <div className={styles.statsSection}>
                    <h2 className={styles.sectionTitle}>{pageContent.mostChangeTitle}</h2>
                    <div className={styles.mostChangeHighlight}>
                        <p>
                            <strong>{metricName}</strong>:
                            {' '}
                            {pageContent.changeLabel}
                            {' '}
                            {/* Используем переменные percentageColor и percentageDisplay */}
                            <span style={{ color: percentageColor, fontWeight: 'bold' }}>
                                {percentageDisplay}%
                            </span>
                            {' '}
                            (Последнее: {latestValue} {unit})
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    // --- Основной Рендеринг Компонента ---
    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>{pageContent.pageTitle}</h1>

            {/* Рендеринг секции "Наиболее Значимое Изменение" через функцию */}
            {renderMostChangedMetric()}

             {/* Секция "Все Изменения" */}
             {allChanges.length > 0 && pageContent && (
                 <div className={styles.statsSection}>
                     <h2 className={styles.sectionTitle}>{pageContent.allChangesTitle}</h2>
                     <ul className={styles.changesList}>
                         {allChanges.map(change => {
                             // ИСПРАВЛЕНО: Добавляем проверку типа и для этого списка
                             const changePercentageDisplay = typeof change.percentage_of_change === 'number'
                                 ? change.percentage_of_change.toFixed(1)
                                 : 'N/A';
                             const changePercentageColor = typeof change.percentage_of_change === 'number' && change.percentage_of_change >= 0
                                 ? 'green'
                                 : 'red';

                             return (
                                 <li key={change.metricName} className={styles.changeItem}>
                                     <strong>{change.metricName}:</strong>
                                     {' '}
                                     {pageContent.changeLabel} 
                                     {' '}
                                     <span style={{ color: changePercentageColor, fontWeight: 'bold' }}>
                                         {changePercentageDisplay}%
                                     </span>
                                     {' '}
                                     (Последнее: {change.latestValue} {change.unit}, Предыдущее: {change.previousValue !== null ? `${change.previousValue} ${change.unit}` : 'Н/Д'})
                                 </li>
                             );
                         })}
                     </ul>
                 </div>
             )}

            {/* Секция "Тренды Здоровья" (Графики) */}
            {pageContent && (
                <div className={styles.statsSection}>
                    <h2 className={styles.sectionTitle}>{pageContent.trendsTitle}</h2>
                    
                    {healthStats && healthStats.length > 0 && (
                        <div className={styles.metricSelectionControls}>
                        {/* Add the class here */}
                        <label className={styles.groupLabel}>{pageContent.selectMetricsLabel}</label>
                        <div className={styles.checkboxGroup}>
                            {healthStats
                                .filter(metric => metric.list_of_all_the_values && metric.list_of_all_the_values.length > 0)
                                .map(metric => (
                                <label key={metric.name_of_component} className={styles.metricCheckboxLabel}>
                                    <input
                                        type="checkbox"
                                        value={metric.name_of_component}
                                        checked={selectedMetricsForChart.includes(metric.name_of_component)}
                                        onChange={(e) => handleMetricSelection(metric.name_of_component, e.target.checked)}
                                        // disabled={someCondition} // Add if needed
                                    />
                                    {/* Add this span for the custom checkbox style */}
                                    <span className={styles.customCheckbox}></span>
                                    {/* Wrap text in span (recommended) */}
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
                                                <LineChart
                                                    data={metricChartData}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis domain={['auto', 'auto']} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey={metricName}
                                                        stroke={['#8884d8', '#82ca9d', '#ffc658', '#a4dee3', '#f45b69', '#b072d1'][index % 6]}
                                                        activeDot={{ r: 8 }}
                                                        name={`${metricName} (${originalMetric?.name_of_unit})`}
                                                        unit={originalMetric?.name_of_unit}
                                                        connectNulls={true}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={metricName} className={styles.individualChartContainer}>
                                        <h3 className={styles.chartTitle}>{metricName} ({originalMetric?.name_of_unit})</h3>
                                        <p>Недостаточно данных для построения графика для {metricName}.</p>
                                    </div>
                                ); 
                            })}
                        </div>
                    ) : (
                        <p>{pageContent.chartsPlaceholder}</p>
                    )}
                </div>
            )}
        </div>
    );
}
