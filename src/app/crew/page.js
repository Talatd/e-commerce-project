"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './crew.module.css';

export default function CrewDashboard() {
    const { user, loading, authFetch } = useAuth();
    const router = useRouter();
    const [activeTask, setActiveTask] = useState(null);
    const [result, setResult] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);
    const [customerQuery, setCustomerQuery] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const runCrewTask = async (taskType) => {
        setIsRunning(true);
        setActiveTask(taskType);
        setResult(null);
        setError(null);

        try {
            const res = await authFetch('/api/crew', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task_type: taskType,
                    customer_query: customerQuery,
                }),
            });

            if (!res) return;
            const data = await res.json();

            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || 'An error occurred');
            }
        } catch (err) {
            setError('Failed to connect to CrewAI backend. Make sure it is running.');
        } finally {
            setIsRunning(false);
        }
    };

    const agents = [
        {
            id: 'analysis',
            name: 'Product Analyst',
            icon: '📊',
            description: 'Analyzes your product catalog to identify trends, strengths, weaknesses, and market positioning.',
            color: '#6366f1',
        },
        {
            id: 'marketing',
            name: 'Marketing Strategist',
            icon: '📝',
            description: 'Generates SEO-optimized product descriptions, compelling marketing copy, and promotional taglines.',
            color: '#ec4899',
        },
        {
            id: 'advice',
            name: 'Customer Advisor',
            icon: '🛒',
            description: 'Provides personalized shopping recommendations based on customer needs and preferences.',
            color: '#10b981',
        },
    ];

    const formatResult = (text) => {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/\n/g, '<br/>');
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroBadge}>🤖 CrewAI Multi-Agent System</div>
                <h1 className={styles.heroTitle}>
                    AI Crew <span className={styles.gradient}>Dashboard</span>
                </h1>
                <p className={styles.heroSubtitle}>
                    Harness the power of multiple AI agents working together to analyze your products,
                    generate marketing content, and provide personalized shopping advice.
                </p>
            </div>

            {/* Agent Cards */}
            <div className={styles.agentGrid}>
                {agents.map((agent) => (
                    <div
                        key={agent.id}
                        className={`${styles.agentCard} ${activeTask === agent.id ? styles.agentCardActive : ''}`}
                        style={{ '--agent-color': agent.color }}
                    >
                        <div className={styles.agentIcon}>{agent.icon}</div>
                        <h3 className={styles.agentName}>{agent.name}</h3>
                        <p className={styles.agentDesc}>{agent.description}</p>

                        {agent.id === 'advice' && (
                            <input
                                type="text"
                                className={styles.queryInput}
                                placeholder="What are you looking for?"
                                value={customerQuery}
                                onChange={(e) => setCustomerQuery(e.target.value)}
                                disabled={isRunning}
                            />
                        )}

                        <button
                            className={styles.runBtn}
                            onClick={() => runCrewTask(agent.id)}
                            disabled={isRunning}
                            style={{ background: agent.color }}
                        >
                            {isRunning && activeTask === agent.id ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Agent Working...
                                </>
                            ) : (
                                <>▶ Run {agent.name}</>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Run All Button */}
            <div className={styles.runAllSection}>
                <button
                    className={styles.runAllBtn}
                    onClick={() => runCrewTask('all')}
                    disabled={isRunning}
                >
                    {isRunning && activeTask === 'all' ? (
                        <>
                            <span className={styles.spinner}></span>
                            All Agents Working...
                        </>
                    ) : (
                        <>🚀 Run All Agents (Full Crew Kickoff)</>
                    )}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className={styles.errorBox}>
                    <span className={styles.errorIcon}>⚠️</span>
                    <div>
                        <strong>Error</strong>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Results Section */}
            {result && (
                <div className={styles.resultSection}>
                    <div className={styles.resultHeader}>
                        <h2>✅ Crew Results</h2>
                        <span className={styles.resultBadge}>
                            Task: {result.task_type}
                        </span>
                    </div>

                    {result.tasks_output && result.tasks_output.map((task, index) => (
                        <div key={index} className={styles.taskResult}>
                            <div className={styles.taskResultHeader}>
                                <span className={styles.taskAgent}>🤖 {task.agent}</span>
                            </div>
                            <div
                                className={styles.taskOutput}
                                dangerouslySetInnerHTML={{ __html: formatResult(task.output) }}
                            />
                        </div>
                    ))}

                    {/* Final Combined Result */}
                    <div className={styles.finalResult}>
                        <h3>📋 Final Combined Output</h3>
                        <div
                            className={styles.taskOutput}
                            dangerouslySetInnerHTML={{ __html: formatResult(result.result) }}
                        />
                    </div>
                </div>
            )}

            {/* Architecture Info */}
            <div className={styles.archSection}>
                <h2 className={styles.archTitle}>🏗️ System Architecture</h2>
                <div className={styles.archGrid}>
                    <div className={styles.archCard}>
                        <div className={styles.archCardIcon}>⚛️</div>
                        <h4>Next.js Frontend</h4>
                        <p>React-based UI sends requests to the API proxy with JWT authentication</p>
                    </div>
                    <div className={styles.archArrow}>→</div>
                    <div className={styles.archCard}>
                        <div className={styles.archCardIcon}>🔗</div>
                        <h4>API Proxy</h4>
                        <p>Next.js API route validates JWT and forwards user-scoped data to CrewAI</p>
                    </div>
                    <div className={styles.archArrow}>→</div>
                    <div className={styles.archCard}>
                        <div className={styles.archCardIcon}>🐍</div>
                        <h4>CrewAI Backend</h4>
                        <p>Flask server orchestrates multiple AI agents using CrewAI framework</p>
                    </div>
                    <div className={styles.archArrow}>→</div>
                    <div className={styles.archCard}>
                        <div className={styles.archCardIcon}>🧠</div>
                        <h4>Gemini LLM</h4>
                        <p>Google Gemini 2.0 Flash processes prompts and generates agent responses</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
