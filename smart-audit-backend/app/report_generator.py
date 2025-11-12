from app.llm_rewriter import (
    get_security_summary,
    get_optimization_suggestions,
    get_best_practice_checklist,
    get_code_change_summary,
    get_contract_description,
    find_vulnerabilities,
    extract_contract_name,
    generate_fixed_contract
)
import logging
import re
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
import hashlib

logger = logging.getLogger(__name__)

class AuditReportGenerator:
    def __init__(self):
        self.start_time = None
        self.analysis_times = {}
        self.metrics = {}
        
    def start_timer(self, operation: str):
        """Start timing an operation"""
        self.start_time = time.time()
        self.analysis_times[operation] = {"start": self.start_time}
        
    def end_timer(self, operation: str):
        """End timing an operation"""
        if operation in self.analysis_times:
            self.analysis_times[operation]["end"] = time.time()
            self.analysis_times[operation]["duration"] = (
                self.analysis_times[operation]["end"] - 
                self.analysis_times[operation]["start"]
            )

    def sanitize_output(self, text: str) -> str:
        """Clean output by removing local paths and tool references."""
        if not isinstance(text, str):
            return ""
        # Remove paths and tool names
        text = re.sub(r'\(?[A-Z]:[\\/].*\)?', '', text)
        text = re.sub(r'(slither|mythril|solhint|solc)', 'analysis', text, flags=re.IGNORECASE)
        return text.strip()

    def calculate_code_metrics(self, code: str) -> Dict[str, Any]:
        """Calculate various code metrics"""
        metrics = {
            "lines_of_code": len([line for line in code.split('\n') if line.strip()]),
            "total_lines": len(code.split('\n')),
            "comment_lines": len([line for line in code.split('\n') if line.strip().startswith('//')]),
            "functions": len(re.findall(r'function\s+\w+', code)),
            "modifiers": len(re.findall(r'modifier\s+\w+', code)),
            "events": len(re.findall(r'event\s+\w+', code)),
            "state_variables": len(re.findall(r'^\s*(?:uint|int|bool|address|string|bytes|mapping)\s+(?:public|private|internal)?\s*\w+', code, re.MULTILINE)),
            "external_calls": len(re.findall(r'\.call\(|\.delegatecall\(|\.staticcall\(', code)),
            "require_statements": len(re.findall(r'require\s*\(', code)),
            "contract_size_bytes": len(code.encode('utf-8')),
            "code_hash": hashlib.sha256(code.encode('utf-8')).hexdigest()[:16]
        }
        
        # Calculate complexity score
        complexity_factors = {
            'functions': metrics['functions'] * 2,
            'external_calls': metrics['external_calls'] * 3,
            'state_variables': metrics['state_variables'] * 1,
            'lines_of_code': metrics['lines_of_code'] * 0.1
        }
        metrics['complexity_score'] = sum(complexity_factors.values())
        
        return metrics

    def get_gas_optimization_analysis(self, code: str) -> Dict[str, Any]:
        """Analyze code for gas optimization opportunities"""
        optimizations = {
            "potential_savings": [],
            "gas_issues": [],
            "optimization_score": 0
        }
        
        # Check for common gas optimization opportunities
        if 'public' in code and 'view' not in code:
            optimizations["potential_savings"].append({
                "type": "Visibility",
                "description": "Consider making non-essential functions private/internal",
                "estimated_savings": "Low"
            })
            
        if re.search(r'for\s*\([^)]*\.length[^)]*\)', code):
            optimizations["gas_issues"].append({
                "type": "Loop Optimization",
                "description": "Array length accessed in loop condition",
                "severity": "Medium",
                "recommendation": "Cache array length before loop"
            })
            
        if 'string' in code and 'storage' in code:
            optimizations["potential_savings"].append({
                "type": "Storage",
                "description": "String storage usage detected",
                "estimated_savings": "Medium"
            })
            
        # Calculate optimization score (0-100)
        total_issues = len(optimizations["gas_issues"])
        optimizations["optimization_score"] = max(0, 100 - (total_issues * 15))
        
        return optimizations

    def format_section_header(self, title: str, level: int = 2) -> str:
        """Create consistently formatted section headers"""
        header_char = "#" * level
        return f"\n{header_char} {title}\n\n"

    def format_subsection_header(self, title: str) -> str:
        """Create consistently formatted subsection headers"""
        return f"\n### {title}\n\n"

    def format_info_box(self, content: str, box_type: str = "info") -> str:
        """Create formatted info boxes"""
        icons = {
            "info": "ℹ️",
            "warning": "⚠️",
            "success": "✅",
            "error": "❌",
            "critical": "🚨"
        }
        icon = icons.get(box_type, "ℹ️")
        return f"\n> {icon} **{box_type.upper()}**\n> \n> {content}\n\n"

    def format_table_row(self, columns: List[str], widths: List[int] = None) -> str:
        """Format table rows with consistent alignment"""
        if not widths:
            widths = [max(len(str(col)), 10) for col in columns]
        
        formatted_cols = []
        for i, col in enumerate(columns):
            width = widths[i] if i < len(widths) else 10
            formatted_cols.append(str(col).ljust(width))
        
        return f"| {' | '.join(formatted_cols)} |\n"

    def create_metrics_table(self, metrics: Dict[str, Any], title: str = "Metrics") -> str:
        """Create a well-formatted metrics table"""
        table_lines = []
        table_lines.append(f"\n#### {title}\n")
        table_lines.append("| Metric | Value | Assessment |\n")
        table_lines.append("|--------|-------|------------|\n")
        
        metric_assessments = {
            'functions': lambda x: 'High complexity' if x > 10 else 'Moderate' if x > 5 else 'Simple',
            'state_variables': lambda x: 'Many storage operations' if x > 10 else 'Standard',
            'external_calls': lambda x: '⚠️ High risk' if x > 3 else '✅ Low risk' if x <= 1 else '🟡 Medium risk',
            'events': lambda x: 'Good logging' if x > 2 else 'Consider more events',
            'modifiers': lambda x: 'Good access control' if x > 0 else '⚠️ No access modifiers',
            'require_statements': lambda x: 'Good validation' if x > 2 else 'Consider more validation',
            'complexity_score': lambda x: '🔴 High' if x > 50 else '🟡 Medium' if x > 20 else '🟢 Low'
        }
        
        display_metrics = [
            ('functions', 'Functions'),
            ('state_variables', 'State Variables'),
            ('external_calls', 'External Calls'),
            ('events', 'Events'),
            ('modifiers', 'Modifiers'),
            ('require_statements', 'Require Statements'),
            ('complexity_score', 'Complexity Score')
        ]
        
        for key, display_name in display_metrics:
            value = metrics.get(key, 0)
            if key == 'complexity_score':
                value_str = f"{value:.1f}"
            else:
                value_str = str(value)
            
            assessment = metric_assessments.get(key, lambda x: 'N/A')(value)
            table_lines.append(f"| {display_name} | {value_str} | {assessment} |\n")
        
        return "".join(table_lines)

    def generate_executive_summary(self, vulnerabilities: Dict, metrics: Dict, 
                                 gas_analysis: Dict, timing_data: Dict, has_fixed_code: bool = False) -> str:
        """Generate executive summary section with better formatting"""
        total_vulns = vulnerabilities.get('total_vulnerabilities', 0)
        risk_score = vulnerabilities.get('overall_risk_score', 0)
        
        # Determine risk level
        if risk_score >= 8:
            risk_level = "🔴 **CRITICAL RISK**"
            risk_color = "critical"
        elif risk_score >= 6:
            risk_level = "🟠 **HIGH RISK**"
            risk_color = "warning"
        elif risk_score >= 4:
            risk_level = "🟡 **MEDIUM RISK**"
            risk_color = "warning"
        elif risk_score >= 2:
            risk_level = "🟢 **LOW RISK**"
            risk_color = "success"
        else:
            risk_level = "✅ **MINIMAL RISK**"
            risk_color = "success"
        
        summary_lines = []
        summary_lines.append(self.format_section_header("📋 Executive Summary"))
        
        # Risk Assessment Box
        risk_content = f"Risk Level: {risk_level}\nComplexity Score: {metrics.get('complexity_score', 0):.1f}\nAnalysis Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\nRemediation: {'✅ Fixed code provided' if has_fixed_code else '⚠️ Manual fixes required'}"
        summary_lines.append(self.format_info_box(risk_content, risk_color))
        
        # Key Findings Section
        summary_lines.append(self.format_subsection_header("🎯 Key Findings"))
        
        findings = []
        if total_vulns > 0:
            severity = vulnerabilities.get('severity_breakdown', {})
            critical = severity.get('critical', 0)
            high = severity.get('high', 0)
            
            if critical > 0:
                findings.append(f"🚨 **URGENT ACTION REQUIRED**: {critical} critical vulnerabilities detected")
            if high > 0:
                findings.append(f"🔥 **HIGH PRIORITY**: {high} high-severity security issues found")
                
            if has_fixed_code:
                findings.append("✅ **SOLUTION PROVIDED**: Remediated contract code included with security fixes")
            else:
                findings.append("⚠️ **ACTION NEEDED**: Security remediation recommended before deployment")
        else:
            findings.append("✅ **SECURITY STATUS**: No critical vulnerabilities detected")
            
        if gas_analysis.get('optimization_score', 0) < 70:
            findings.append("⛽ **OPTIMIZATION**: Gas efficiency improvements available")
            
        complexity_level = 'High' if metrics.get('complexity_score', 0) > 50 else 'Moderate' if metrics.get('complexity_score', 0) > 20 else 'Low'
        findings.append(f"📊 **COMPLEXITY**: {complexity_level} contract complexity level")
        
        if has_fixed_code:
            findings.append("🔧 **ENHANCEMENT**: Security measures implemented in fixed version")
        
        for finding in findings:
            summary_lines.append(f"- {finding}\n")
        
        summary_lines.append("\n" + "="*80 + "\n")
        
        return "".join(summary_lines)
    def generate_detailed_report(self, original_code: str, vulnerabilities: Dict, 
                               fixed_code: str = None, contract_description: str = None,
                               auto_generate_fixed: bool = True) -> str:
        """
        Creates a comprehensive audit report with enhanced formatting and readability.
        """
        report_start_time = time.time()
        
        # Auto-generate fixed code if not provided and vulnerabilities exist
        if not fixed_code and auto_generate_fixed:
            total_vulns = vulnerabilities.get('total_vulnerabilities', 0) if isinstance(vulnerabilities, dict) else 0
            if total_vulns > 0:
                try:
                    self.start_timer('code_remediation')
                    logger.info("Auto-generating fixed contract code...")
                    fixed_code = generate_fixed_contract(original_code, "")
                    self.end_timer('code_remediation')
                    logger.info("Fixed contract code generated successfully")
                except Exception as e:
                    logger.warning(f"Could not auto-generate fixed code: {e}")
                    self.end_timer('code_remediation')
        
        # Calculate metrics
        original_metrics = self.calculate_code_metrics(original_code)
        gas_analysis = self.get_gas_optimization_analysis(original_code)
        
        fixed_metrics = None
        if fixed_code:
            fixed_metrics = self.calculate_code_metrics(fixed_code)
        
        # Start building report with improved formatting
        report_lines = []
        
        # Header Section
        report_lines.append("# 🛡️ COMPREHENSIVE SMART CONTRACT SECURITY AUDIT REPORT\n")
        report_lines.append("="*80 + "\n\n")
        report_lines.append(f"**Generated:** {datetime.now().strftime('%B %d, %Y at %H:%M:%S')}\n")
        report_lines.append(f"**Report Version:** 2.2 Enhanced\n")
        report_lines.append(f"**Analysis Engine:** AuditSmartAi Advanced Security Analyzer\n\n")
        report_lines.append("="*80 + "\n")

        # Executive Summary
        executive_summary = self.generate_executive_summary(
            vulnerabilities, original_metrics, gas_analysis, self.analysis_times, 
            has_fixed_code=bool(fixed_code)
        )
        report_lines.append(executive_summary)

        # Contract Overview Section
        contract_name = vulnerabilities.get('contract_name', extract_contract_name(original_code))
        report_lines.append(self.format_section_header("📄 Contract Overview"))
        
        overview_info = [
            f"**Contract Name:** `{contract_name}`",
            f"**Code Hash:** `{original_metrics['code_hash']}`",
            f"**Contract Size:** {original_metrics['contract_size_bytes']:,} bytes",
            f"**Lines of Code:** {original_metrics['lines_of_code']:,} (excluding comments)",
            f"**Total Lines:** {original_metrics['total_lines']:,} (including comments)"
        ]
        
        for info in overview_info:
            report_lines.append(f"{info}\n")
        
        if contract_description:
            report_lines.append(f"\n**Contract Description:**\n")
            report_lines.append(f"> {self.sanitize_output(contract_description)}\n")
        
        report_lines.append("\n" + "-"*80 + "\n")

        # Original Contract Code Section
        report_lines.append(self.format_section_header("💻 Original Contract Code"))
        report_lines.append("```solidity\n")
        report_lines.append(original_code)
        report_lines.append("\n```\n")
        report_lines.append("-"*80 + "\n")

        # Vulnerability Analysis Section
        if vulnerabilities and isinstance(vulnerabilities, dict) and 'vulnerabilities' in vulnerabilities:
            report_lines.append(self.format_section_header("🚨 Security Vulnerability Analysis"))

            total_vulns = vulnerabilities.get('total_vulnerabilities', 0)
            risk_score = vulnerabilities.get('overall_risk_score', 0)

            # Analysis Summary
            report_lines.append(self.format_subsection_header("📊 Analysis Summary"))
            summary_info = [
                f"**Total Findings:** {total_vulns}",
                f"**Overall Risk Score:** {risk_score}/10",
                f"**Analysis Duration:** {self.analysis_times.get('vulnerability_analysis', {}).get('duration', 0):.2f} seconds"
            ]

            for info in summary_info:
                report_lines.append(f"{info}\n")

            if total_vulns > 0:
                severity = vulnerabilities.get('severity_breakdown', {})
                if severity:
                    report_lines.append(self.format_subsection_header("🚨 Severity Distribution"))
                    
                    severity_details = {
                        'critical': ('🔴 Critical', 'System compromising', 'Immediate fix required'),
                        'high': ('🟠 High', 'Security breach risk', 'Fix before deployment'),
                        'medium': ('🟡 Medium', 'Potential vulnerability', 'Should be addressed'),
                        'low': ('🟢 Low', 'Minor security concern', 'Consider fixing')
                    }

                    for level, (display_name, impact, action) in severity_details.items():
                        count = severity.get(level, 0)
                        if count > 0:
                            report_lines.append(f"- {display_name}: {count} findings - {impact} - {action}\n")

                # Detailed Findings
                report_lines.append(self.format_subsection_header("🔍 Detailed Security Findings"))

                for i, vuln in enumerate(vulnerabilities.get('vulnerabilities', []), 1):
                    severity = vuln.get('severity', 'Unknown')
                    severity_emoji = {'Critical':'🔴', 'High':'🟠', 'Medium':'🟡', 'Low':'🟢'}.get(severity, '⚪')

                    # Vulnerability header
                    report_lines.append(f"\n#### Finding #{i}: {severity_emoji} {self.sanitize_output(vuln.get('title', 'Security Issue'))}\n\n")

                    # Vulnerability details in organized format
                    vuln_details = [
                        f"**Severity Level:** {severity}",
                        f"**Location:** {self.sanitize_output(vuln.get('location', 'Not specified'))}",
                        f"**Impact Assessment:** {self.sanitize_output(vuln.get('impact', 'Not specified'))}"
                    ]

                    for detail in vuln_details:
                        report_lines.append(f"{detail}\n")

                    # Description
                    if vuln.get('description'):
                        report_lines.append(f"\n**Description:**\n")
                        report_lines.append(f"{self.sanitize_output(vuln.get('description', ''))}\n")

                    # Recommendation
                    if vuln.get('recommendation'):
                        report_lines.append(f"\n**Recommended Fix:**\n")
                        report_lines.append(f"{self.sanitize_output(vuln.get('recommendation', ''))}\n")

                    report_lines.append("\n" + "."*60 + "\n")

                # Overall Assessment
                if vulnerabilities.get('summary'):
                    report_lines.append(self.format_subsection_header("📋 Overall Security Assessment"))
                    report_lines.append(f"{self.sanitize_output(vulnerabilities['summary'])}\n")
            else:
                success_msg = "No security vulnerabilities were detected during the analysis. The contract appears to follow secure coding practices."
                report_lines.append(self.format_info_box(success_msg, "success"))

            report_lines.append("-"*80 + "\n")

        # Gas Optimization Analysis
        report_lines.append(self.format_section_header("⛽ Gas Optimization Analysis"))

        opt_score = gas_analysis.get('optimization_score', 0)
        score_color = "success" if opt_score >= 80 else "warning" if opt_score >= 60 else "error"

        opt_info = f"Gas Optimization Score: {opt_score}/100\nOptimization Level: {'Excellent' if opt_score >= 80 else 'Good' if opt_score >= 60 else 'Needs Improvement'}"
        report_lines.append(self.format_info_box(opt_info, score_color))

        if gas_analysis.get('gas_issues'):
            report_lines.append(self.format_subsection_header("⚠️ Gas Efficiency Issues"))
            for i, issue in enumerate(gas_analysis['gas_issues'], 1):
                severity_emoji = {'High': '🔴', 'Medium': '🟡', 'Low': '🟢'}.get(issue.get('severity', 'Low'), '🟢')
                report_lines.append(f"{i}. {severity_emoji} **{issue['type']}**\n")
                report_lines.append(f"   - Issue: {issue['description']}\n")
                report_lines.append(f"   - Fix: {issue['recommendation']}\n\n")

        if gas_analysis.get('potential_savings'):
            report_lines.append(self.format_subsection_header("💡 Optimization Opportunities"))
            for i, saving in enumerate(gas_analysis['potential_savings'], 1):
                savings_level = saving['estimated_savings']
                savings_emoji = {'High': '🔥', 'Medium': '🟡', 'Low': '🟢'}.get(savings_level, '🟢')
                report_lines.append(f"{i}. {savings_emoji} **{saving['type']}** (Savings: {savings_level})\n")
                report_lines.append(f"   - {saving['description']}\n\n")

        report_lines.append("-"*80 + "\n")

        # Fixed/Remediated Contract Code
        if fixed_code:
            report_lines.append(self.format_section_header("🔧 Remediated Contract Code"))

            total_vulns = vulnerabilities.get('total_vulnerabilities', 0) if isinstance(vulnerabilities, dict) else 0
            if total_vulns > 0:
                remediation_msg = f"The following enhanced contract includes fixes for {total_vulns} identified security issues, along with additional improvements and optimizations."
                report_lines.append(self.format_info_box(remediation_msg, "success"))
            else:
                enhancement_msg = "Enhanced version with improved security practices, gas optimizations, and code quality improvements."
                report_lines.append(self.format_info_box(enhancement_msg, "info"))

            report_lines.append("```solidity\n")
            report_lines.append(fixed_code)
            report_lines.append("\n```\n")

            # Improvement Summary
            if fixed_metrics:
                report_lines.append(self.format_subsection_header("📈 Security Improvements Summary"))

                improvements = []
                if fixed_metrics.get('require_statements', 0) > original_metrics.get('require_statements', 0):
                    improvements.append("✅ Enhanced input validation and error handling")
                if fixed_metrics.get('modifiers', 0) > original_metrics.get('modifiers', 0):
                    improvements.append("✅ Improved access control mechanisms")
                if fixed_metrics.get('external_calls', 0) < original_metrics.get('external_calls', 0):
                    improvements.append("✅ Reduced external call attack surface")
                if fixed_metrics.get('complexity_score', 0) < original_metrics.get('complexity_score', 0):
                    improvements.append("✅ Simplified and optimized contract logic")

                if improvements:
                    report_lines.append("**Key Security Enhancements:**\n\n")
                    for improvement in improvements:
                        report_lines.append(f"  {improvement}\n")
                    report_lines.append("\n")

            # Change Summary
            try:
                if changes := get_code_change_summary(original_code, fixed_code):
                    report_lines.append(self.format_subsection_header("📝 Detailed Code Changes"))
                    report_lines.append(f"{self.sanitize_output(changes)}\n")
            except Exception as e:
                logger.debug(f"Couldn't generate change summary: {e}")

            report_lines.append("-"*80 + "\n")

        # Additional Analysis Sections
        additional_sections = [
            ("🛡️ Security Assessment Summary", get_security_summary, "security_summary"),
            ("⚡ Performance & Optimization Recommendations", get_optimization_suggestions, "optimization_suggestions"),
            ("✅ Best Practices Compliance Checklist", get_best_practice_checklist, "best_practices")
        ]

        for title, getter, timing_key in additional_sections:
            try:
                self.start_timer(timing_key)
                analysis_code = fixed_code if fixed_code else original_code
                content = getter(analysis_code)
                self.end_timer(timing_key)

                if content:
                    report_lines.append(self.format_section_header(title))
                    if isinstance(content, list):
                        for i, item in enumerate(content, 1):
                            if item:
                                report_lines.append(f"{i}. {self.sanitize_output(item)}\n")
                    else:
                        report_lines.append(f"{self.sanitize_output(content)}\n")
                    report_lines.append("\n" + "-"*80 + "\n")
            except Exception as e:
                logger.debug(f"Skipping {title} section due to error: {e}")

        # Footer Section
        report_lines.append(self.format_section_header("📋 Report Summary & Information"))

        total_time = time.time() - report_start_time
        footer_info = [
            f"**Report Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"**Analysis Engine:** Advanced LLM Security Scanner v2.2 Enhanced",
            f"**Report Format:** Comprehensive Security Audit with Automated Remediation",
            f"**Contract Hash:** `{original_metrics['code_hash']}`",
            f"**Remediation Status:** {'✅ Enhanced contract code provided' if fixed_code else '⚠️ Manual security fixes required'}",
            f"**Total Analysis Time:** {total_time:.2f} seconds"
        ]

        for info in footer_info:
            report_lines.append(f"{info}\n")

        # Disclaimer
        disclaimer = """
**IMPORTANT DISCLAIMER:**
This automated security audit report was generated using advanced static analysis and machine learning techniques. While comprehensive, this analysis should be supplemented with manual code review and testing. The remediated code includes security improvements but should be thoroughly tested in a development environment before production deployment.

**RECOMMENDATIONS:**
- Perform comprehensive testing of the remediated code
- Conduct additional manual security reviews
- Implement proper access controls and monitoring
- Follow deployment best practices for smart contracts
- Consider additional audits for high-value contracts
"""

        report_lines.append(self.format_info_box(disclaimer.strip(), "warning"))

        return "".join(report_lines)
    def format_vulnerability_card(self, vuln: Dict, index: int) -> str:
        """Format individual vulnerability as a card-like structure"""
        severity = vuln.get('severity', 'Unknown')
        severity_emoji = {'Critical':'🔴', 'High':'🟠', 'Medium':'🟡', 'Low':'🟢'}.get(severity, '⚪')
        
        card_lines = []
        card_lines.append(f"\n┌─ Finding #{index}: {severity_emoji} {severity.upper()} SEVERITY ─┐\n")
        card_lines.append(f"│ {self.sanitize_output(vuln.get('title', 'Security Issue'))} │\n")
        card_lines.append("├" + "─"*50 + "┤\n")
        
        # Location
        if vuln.get('location'):
            card_lines.append(f"│ 📍 Location: {self.sanitize_output(vuln.get('location', 'Not specified'))[:40]} │\n")
        
        # Impact
        if vuln.get('impact'):
            card_lines.append(f"│ 💥 Impact: {self.sanitize_output(vuln.get('impact', 'Not specified'))[:42]} │\n")
        
        card_lines.append("├" + "─"*50 + "┤\n")
        
        # Description
        if vuln.get('description'):
            desc = self.sanitize_output(vuln.get('description', ''))
            # Wrap description text
            desc_lines = [desc[i:i+45] for i in range(0, len(desc), 45)]
            for line in desc_lines[:3]:  # Limit to 3 lines
                card_lines.append(f"│ {line:<45} │\n")
            if len(desc_lines) > 3:
                card_lines.append(f"│ {'...(see full details above)':<45} │\n")
        
        # Recommendation
        if vuln.get('recommendation'):
            card_lines.append("├" + "─"*50 + "┤\n")
            rec = self.sanitize_output(vuln.get('recommendation', ''))
            rec_lines = [rec[i:i+45] for i in range(0, len(rec), 45)]
            card_lines.append(f"│ 🔧 FIX: {rec_lines[0] if rec_lines else '':<40} │\n")
            for line in rec_lines[1:2]:  # Show up to 2 lines
                card_lines.append(f"│      {line:<40} │\n")
        
        card_lines.append("└" + "─"*50 + "┘\n")
        
        return "".join(card_lines)


def generate_report(original_code: str, vulnerabilities, fixed_code: str = None, 
                   contract_description: str = None, auto_generate_fixed: bool = True) -> str:
    """
    Main function to generate a comprehensive audit report with enhanced formatting.
    """
    generator = AuditReportGenerator()
    
    # Time the vulnerability analysis if not already done
    if not hasattr(generator, 'vulnerability_analysis_time'):
        generator.start_timer('vulnerability_analysis')
        generator.end_timer('vulnerability_analysis')
    
    return generator.generate_detailed_report(
        original_code, vulnerabilities, fixed_code, contract_description, auto_generate_fixed
    )


def generate_complete_audit_report(original_code: str, include_fixed_code: bool = True, 
                                 include_description: bool = True) -> str:
    """
    Generate a complete audit report with all features enabled and enhanced formatting.
    """
    generator = AuditReportGenerator()
    
    try:
        # Step 1: Find vulnerabilities
        generator.start_timer('vulnerability_analysis')
        vulnerabilities = find_vulnerabilities(original_code)
        generator.end_timer('vulnerability_analysis')
        
        # Step 2: Get contract description if requested
        contract_description = None
        if include_description:
            try:
                generator.start_timer('contract_description')
                contract_description = get_contract_description(original_code)
                generator.end_timer('contract_description')
            except Exception as e:
                logger.warning(f"Could not generate contract description: {e}")
        
        # Step 3: Generate fixed code if requested and vulnerabilities exist
        fixed_code = None
        if include_fixed_code:
            total_vulns = vulnerabilities.get('total_vulnerabilities', 0) if isinstance(vulnerabilities, dict) else 0
            if total_vulns > 0:
                try:
                    generator.start_timer('code_remediation')
                    fixed_code = generate_fixed_contract(original_code, "")
                    generator.end_timer('code_remediation')
                    logger.info("Fixed contract code generated successfully")
                except Exception as e:
                    logger.warning(f"Could not generate fixed code: {e}")
        
        # Step 4: Generate the comprehensive report
        return generator.generate_detailed_report(
            original_code, vulnerabilities, fixed_code, contract_description, False
        )
        
    except Exception as e:
        logger.error(f"Error in complete audit report generation: {e}")
        raise


def generate_enhanced_report(original_code: str, vulnerabilities, fixed_code: str = None, 
                           contract_description: str = None, include_metrics: bool = True) -> str:
    """
    Generate an enhanced report with improved formatting and visual appeal.
    """
    return generate_report(original_code, vulnerabilities, fixed_code, contract_description, True)


def generate_summary_report(original_code: str, vulnerabilities, fixed_code: str = None) -> str:
    """
    Generate a concise summary report for quick overview.
    """
    generator = AuditReportGenerator()
    original_metrics = generator.calculate_code_metrics(original_code)
    gas_analysis = generator.get_gas_optimization_analysis(original_code)
    
    total_vulns = vulnerabilities.get('total_vulnerabilities', 0) if isinstance(vulnerabilities, dict) else 0
    risk_score = vulnerabilities.get('overall_risk_score', 0) if isinstance(vulnerabilities, dict) else 0
    
    # Generate quick summary
    summary_lines = []
    summary_lines.append("# 📊 SMART CONTRACT AUDIT SUMMARY\n")
    summary_lines.append("="*50 + "\n\n")
    
    # Risk Assessment
    if risk_score >= 8:
        risk_status = "🔴 CRITICAL RISK - Immediate action required"
    elif risk_score >= 6:
        risk_status = "🟠 HIGH RISK - Fix before deployment"
    elif risk_score >= 4:
        risk_status = "🟡 MEDIUM RISK - Should be addressed"
    elif risk_score >= 2:
        risk_status = "🟢 LOW RISK - Minor issues"
    else:
        risk_status = "✅ MINIMAL RISK - Good security posture"
    
    summary_lines.append(f"**Risk Assessment:** {risk_status}\n")
    summary_lines.append(f"**Vulnerabilities Found:** {total_vulns}\n")
    summary_lines.append(f"**Risk Score:** {risk_score}/10\n")
    summary_lines.append(f"**Gas Optimization Score:** {gas_analysis.get('optimization_score', 0)}/100\n")
    summary_lines.append(f"**Code Complexity:** {original_metrics.get('complexity_score', 0):.1f}\n")
    summary_lines.append(f"**Remediation Available:** {'✅ Yes' if fixed_code else '❌ Manual fixes needed'}\n\n")
    
    if total_vulns > 0:
        severity = vulnerabilities.get('severity_breakdown', {})
        summary_lines.append("**Vulnerability Breakdown:**\n")
        for level in ['critical', 'high', 'medium', 'low']:
            count = severity.get(level, 0)
            if count > 0:
                emoji = {'critical':'🔴', 'high':'🟠', 'medium':'🟡', 'low':'🟢'}[level]
                summary_lines.append(f"- {emoji} {level.title()}: {count}\n")
    
    summary_lines.append(f"\n*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n")
    
    return "".join(summary_lines)