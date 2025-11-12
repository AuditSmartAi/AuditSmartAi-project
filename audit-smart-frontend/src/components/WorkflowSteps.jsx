import { Upload, Cpu, Wrench, FileText, Rocket, Coins, Zap, Check } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function DynamicWorkflowSteps() {
    const [activeStep, setActiveStep] = useState(0)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef(null)

    const steps = [
        {
            icon: Upload,
            title: "Upload Contract",
            description: "Drag & drop your .sol file for analysis",
            gradient: "linear-gradient(135deg, #a855f7, #ec4899, #ef4444)",
            bgGradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))",
            particles: "#a855f7",
            stats: "Instant upload"
        },
        {
            icon: Cpu,
            title: "AI Analysis",
            description: "Deep learning models scan for vulnerabilities",
            gradient: "linear-gradient(135deg, #22c55e, #10b981, #14b8a6)",
            bgGradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(20, 184, 166, 0.2))",
            particles: "#22c55e",
            stats: "< 30 seconds"
        },
        {
            icon: Wrench,
            title: "Apply Fixes",
            description: "AI-suggested improvements applied automatically",
            gradient: "linear-gradient(135deg, #f59e0b, #f97316, #ef4444)",
            bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))",
            particles: "#f59e0b",
            stats: "Auto-remediation"
        },
        {
            icon: FileText,
            title: "Get Report",
            description: "Comprehensive security audit with ratings",
            gradient: "linear-gradient(135deg, #3b82f6, #06b6d4, #6366f1)",
            bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))",
            particles: "#3b82f6",
            stats: "Detailed insights"
        },
        {
            icon: Rocket,
            title: "Deploy",
            description: "One-click deployment to your chosen network",
            gradient: "linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc)",
            bgGradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2))",
            particles: "#8b5cf6",
            stats: "Multi-chain"
        },
        {
            icon: Coins,
            title: "Mint NFT",
            description: "Create and distribute your tokens seamlessly",
            gradient: "linear-gradient(135deg, #eab308, #f59e0b, #facc15)",
            bgGradient: "linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(245, 158, 11, 0.2))",
            particles: "#eab308",
            stats: "Ready to mint"
        }
    ]

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting)
            },
            { threshold: 0.3 }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (isVisible) {
            const interval = setInterval(() => {
                setActiveStep((prev) => (prev + 1) % steps.length)
            }, 3000)
            return () => clearInterval(interval)
        }
    }, [isVisible, steps.length])

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            })
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const FloatingParticles = ({ color, count = 15 }) => {
        return (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
                pointerEvents: 'none'
            }}>
                {[...Array(count)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: '4px',
                            height: '4px',
                            backgroundColor: color,
                            borderRadius: '50%',
                            opacity: 0.6,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>
        )
    }

    const containerStyle = {
        minHeight: '100vh',
        background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(30, 30, 30, 0.8) 0%, rgba(0, 0, 0, 0.95) 50%),
            linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    }

    const gridStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        backgroundImage: `
            linear-gradient(rgba(100,100,100,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,100,100,0.3) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'pulse 4s ease-in-out infinite'
    }

    return (
        <>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.05; }
                    50% { opacity: 0.1; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes ping {
                    0% { transform: scale(1); opacity: 1; }
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                .floating-orb-1 {
                    animation: bounce 6s ease-in-out infinite;
                }
                .floating-orb-2 {
                    animation: bounce 8s ease-in-out infinite;
                    animation-delay: 2s;
                }
                .floating-orb-3 {
                    animation: bounce 10s ease-in-out infinite;
                    animation-delay: 4s;
                }
            `}</style>
            
            <div ref={containerRef} style={containerStyle}>
                {/* Animated background grid */}
                <div style={gridStyle} />

                {/* Floating orbs */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div 
                        className="floating-orb-1"
                        style={{
                            position: 'absolute',
                            top: '20%',
                            left: '20%',
                            width: '400px',
                            height: '400px',
                            background: 'rgba(168, 85, 247, 0.08)',
                            borderRadius: '50%',
                            filter: 'blur(60px)'
                        }} 
                    />
                    <div 
                        className="floating-orb-2"
                        style={{
                            position: 'absolute',
                            bottom: '20%',
                            right: '20%',
                            width: '350px',
                            height: '350px',
                            background: 'rgba(34, 197, 94, 0.08)',
                            borderRadius: '50%',
                            filter: 'blur(60px)'
                        }} 
                    />
                    <div 
                        className="floating-orb-3"
                        style={{
                            position: 'absolute',
                            top: '60%',
                            left: '60%',
                            width: '300px',
                            height: '300px',
                            background: 'rgba(234, 179, 8, 0.08)',
                            borderRadius: '50%',
                            filter: 'blur(60px)',
                            transform: 'translate(-50%, -50%)'
                        }} 
                    />
                </div>

                <div style={{ 
                    position: 'relative', 
                    zIndex: 10, 
                    maxWidth: '1400px', 
                    margin: '0 auto', 
                    padding: '0 24px',
                    width: '100%'
                }}>
                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{
                            fontSize: '60px',
                            fontWeight: '900',
                            marginBottom: '24px',
                            background: 'linear-gradient(90deg, #f3f4f6, #ffffff, #f3f4f6)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            lineHeight: '1.1',
                            marginTop: '24px'
                        }}>
                            Complete Workflow
                        </h2>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '16px' 
                        }}>
                            <Zap 
                                size={24} 
                                style={{ 
                                    color: '#9ca3af', 
                                    animation: 'pulse 2s ease-in-out infinite' 
                                }} 
                            />
                            <p style={{ 
                                fontSize: '20px', 
                                color: '#d1d5db',
                                margin: 0
                            }}>
                                From upload to deployment in minutes
                            </p>
                            <Check 
                                size={24} 
                                style={{ 
                                    color: '#22c55e', 
                                    animation: 'pulse 2s ease-in-out infinite' 
                                }} 
                            />
                        </div>
                    </div>

                    {/* Steps Container */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '32px',
                        marginBottom: '48px'
                    }}>
                        {steps.map((step, index) => {
                            const Icon = step.icon
                            const isActive = index === activeStep
                            
                            return (
                                <div
                                    key={index}
                                    style={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'all 0.7s ease',
                                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                        zIndex: isActive ? 20 : 1
                                    }}
                                    onMouseEnter={() => setActiveStep(index)}
                                >
                                    {/* Card */}
                                    <div style={{
                                        position: 'relative',
                                        padding: '32px',
                                        borderRadius: '24px',
                                        backdropFilter: 'blur(12px)',
                                        WebkitBackdropFilter: 'blur(12px)',
                                        border: isActive 
                                            ? '1px solid rgba(55, 65, 81, 0.7)' 
                                            : '1px solid rgba(31, 41, 55, 0.3)',
                                        background: isActive 
                                            ? step.bgGradient 
                                            : 'rgba(17, 24, 39, 0.4)',
                                        boxShadow: isActive 
                                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                                            : '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                                        transition: 'all 0.7s ease',
                                        transformStyle: 'preserve-3d'
                                    }}>
                                        {/* Floating particles */}
                                        {isActive && <FloatingParticles color={step.particles} />}
                                        
                                        {/* Animated border */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            borderRadius: '24px',
                                            background: step.gradient,
                                            opacity: isActive ? 0.3 : 0,
                                            filter: 'blur(4px)',
                                            zIndex: -1,
                                            transition: 'opacity 0.7s ease',
                                            animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none'
                                        }} />
                                        
                                        {/* Step number */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-16px',
                                            right: '-16px',
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '18px',
                                            background: step.gradient,
                                            animation: isActive ? 'spin 2s linear infinite' : 'none',
                                            transition: 'all 0.5s ease'
                                        }}>
                                            {index + 1}
                                        </div>

                                        {/* Icon */}
                                        <div style={{
                                            position: 'relative',
                                            marginBottom: '24px',
                                            animation: isActive ? 'bounce 1s ease-in-out infinite' : 'none'
                                        }}>
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: step.gradient,
                                                padding: '2px',
                                                boxShadow: isActive ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                                            }}>
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    background: '#000000',
                                                    borderRadius: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Icon size={32} color="white" />
                                                </div>
                                            </div>
                                            
                                            {/* Pulse ring */}
                                            {isActive && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    borderRadius: '16px',
                                                    background: step.gradient,
                                                    opacity: 0.3,
                                                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                                                }} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <h3 style={{
                                                fontSize: '28px',
                                                fontWeight: 'bold',
                                                color: isActive ? 'white' : '#f3f4f6',
                                                margin: 0,
                                                transition: 'color 0.3s ease'
                                            }}>
                                                {step.title}
                                            </h3>
                                            
                                            <p style={{
                                                fontSize: '14px',
                                                lineHeight: '1.6',
                                                color: isActive ? '#e5e7eb' : '#9ca3af',
                                                margin: 0,
                                                transition: 'color 0.3s ease'
                                            }}>
                                                {step.description}
                                            </p>
                                            
                                            {/* Stats badge */}
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                alignSelf: 'flex-start',
                                                padding: '6px 14px',
                                                borderRadius: '9999px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: isActive ? 'rgba(0, 0, 0, 0.4)' : 'rgba(31, 41, 55, 0.8)',
                                                color: isActive ? 'white' : '#d1d5db',
                                                border: isActive ? '1px solid rgba(55, 65, 81, 0.5)' : '1px solid rgba(55, 65, 81, 0.3)',
                                                transition: 'all 0.3s ease'
                                            }}>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: step.gradient,
                                                    marginRight: '8px'
                                                }} />
                                                {step.stats}
                                            </div>
                                        </div>

                                        {/* Hover glow */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            borderRadius: '24px',
                                            background: step.gradient,
                                            opacity: isActive ? 0.1 : 0,
                                            filter: 'blur(24px)',
                                            zIndex: -1,
                                            transition: 'opacity 0.5s ease'
                                        }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Progress indicator */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '8px' 
                    }}>
                        {steps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveStep(index)}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: index === activeStep ? '#9ca3af' : '#374151',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    transform: index === activeStep ? 'scale(1.5)' : 'scale(1)'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#6b7280'}
                                onMouseLeave={(e) => e.target.style.background = index === activeStep ? '#9ca3af' : '#374151'}
                            />
                        ))}
                    </div>

                    {/* Flow visualization */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '48px',
                        gap: '16px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            padding: '8px 16px',
                            background: 'rgba(17, 24, 39, 0.6)',
                            border: '1px solid rgba(55, 65, 81, 0.3)',
                            borderRadius: '12px',
                            color: '#9ca3af',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '24px'
                        }}>
                            Upload → AI Analysis → Apply Fixes → Get Report → Deploy → Mint NFT
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}