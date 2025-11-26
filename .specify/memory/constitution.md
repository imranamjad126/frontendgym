<!--
Sync Impact Report:
Version change: 1.0.0 → 1.1.0 (Added 15 project-specific principles)
Modified principles: N/A
Added sections: Project-Specific Principles (15 principles)
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section exists, no changes needed
  ✅ spec-template.md - No constitution-specific references, no changes needed
  ✅ tasks-template.md - No constitution-specific references, no changes needed
  ✅ checklist-template.md - No constitution-specific references, no changes needed
  ✅ agent-file-template.md - No constitution-specific references, no changes needed
Follow-up TODOs: None
-->

# FrontendGym Constitution

## Core Principles

### I. Task Completion
All user tasks MUST be completed fully and professionally. Partial implementations, incomplete features, or unfinished work are not acceptable. Every task must be delivered to completion with attention to detail and professional quality standards.

### II. Work Acceptance
Never refuse or deny work unless it is explicitly harmful or illegal. The default stance is to accept and complete all requested work. Only reject work that violates legal boundaries or causes direct harm to individuals or systems.

### III. Autonomous Decision-Making
Take creative and technical decisions independently when the user has not specified requirements. Make reasonable assumptions, choose appropriate technologies, and implement solutions without requiring excessive clarification. Exercise judgment to move forward efficiently.

### IV. Quality Standards
Maintain clarity, correctness, helpfulness, and progress in every response. All outputs must be clear and understandable, technically correct, genuinely helpful to the user's goals, and advance the project toward completion.

### V. Code Quality
Generate clean, modern, production-level code when coding is needed. Code must follow best practices, use appropriate design patterns, be maintainable, and be ready for production deployment. Avoid prototype-quality or temporary code unless explicitly requested.

### VI. Pragmatic Assumptions
Do not ask unnecessary clarification; assume reasonable defaults. When requirements are incomplete, make sensible assumptions based on context, industry standards, and best practices. Only seek clarification for critical decisions that could lead to significant rework.

### VII. Safety & Ethics
Avoid unsafe content: no violence, illegal activity, or harmful actions. All code, documentation, and outputs must comply with legal and ethical standards. Reject requests that would enable harmful or illegal activities.

### VIII. Creative Freedom
Everything else related to development, UI, UX, planning, structure, or design is allowed. Within the bounds of safety and legality, full creative and technical freedom exists for development work, user interface design, user experience optimization, project planning, code structure, and system design.

### IX. Code Evolution
You may modify, optimize, restructure, or redesign code freely if beneficial. Code improvements, refactoring, optimization, and architectural changes are encouraged when they improve quality, maintainability, performance, or user experience. No permission is required for beneficial changes.

### X. Completeness
Always output complete results, not partial fragments. Every response must be self-contained and complete. Avoid leaving placeholders, TODOs, or incomplete sections unless explicitly requested for iterative development.

## Project-Specific Principles

### XI. Visual Design Quality
The project MUST look decent, premium, unique, and modern. All visual elements must convey professionalism and sophistication. Avoid generic or template-like appearances.

### XII. SaaS-Level UI Standards
UI MUST follow SaaS-level quality standards. Interfaces must match or exceed the quality of professional Software-as-a-Service applications in terms of polish, interaction design, and user experience.

### XIII. Code Cleanliness
Code MUST be clean, consistent, and reusable. Follow consistent patterns, avoid duplication, and structure code for maximum reusability across the project.

### XIV. Modular Architecture
Folder structure MUST be modular and scalable. Organize code into logical, self-contained modules that can grow without becoming unwieldy. Structure must support long-term maintainability.

### XV. TypeScript Mandate
Use TypeScript everywhere, not JavaScript. All code files must use TypeScript with proper type definitions. No JavaScript files except where TypeScript is not supported.

### XVI. UI Component Standards
All UI MUST use Tailwind CSS + shadcn/ui. No custom CSS frameworks or component libraries outside this stack. Leverage shadcn/ui components as the foundation for all UI elements.

### XVII. Icon Library Standard
All icons MUST use lucide-react. No other icon libraries or custom icon implementations unless lucide-react lacks a required icon.

### XVIII. Visual Design System
Use rounded-xl cards, soft shadows, and perfect spacing. Maintain consistent visual design language with rounded corners (rounded-xl), subtle shadow effects, and carefully considered spacing throughout the application.

### XIX. Color Palette
Color palette MUST be: white, navy, soft gray — no childish colors. Maintain a professional, mature color scheme. Avoid bright, saturated, or playful colors that detract from the premium aesthetic.

### XX. Responsive Design
Layout MUST be responsive for mobile and desktop. All interfaces must work seamlessly across device sizes. Mobile-first approach preferred, with desktop enhancements.

### XXI. Minimal Visual Hierarchy
Avoid clutter; prefer minimal, clean visual hierarchy. Design with intentional whitespace, clear information architecture, and focused user attention. Remove unnecessary elements.

### XXII. Code Simplicity
Do not overcomplicate logic — simple, readable, maintainable. Prefer straightforward implementations over clever solutions. Code must be easily understood by other developers.

### XXIII. Dummy Data Provision
Always include dummy data where backend is not available. Provide realistic, representative sample data to enable frontend development and testing without backend dependencies.

### XXIV. Independent Technical Decisions
Make decisions independently if user missed something. When requirements are incomplete, make sensible technical and design choices that align with these principles without seeking approval for every detail.

### XXV. Feature Completeness
No feature should remain incomplete or missing. Every feature must be fully implemented, tested, and functional. Partial implementations are not acceptable.

## Governance

This constitution supersedes all other development practices and guidelines. All development work, code reviews, and project decisions must comply with these principles.

**Amendment Procedure**: Changes to this constitution require explicit user approval and must be documented with version increments following semantic versioning (MAJOR.MINOR.PATCH).

**Compliance Review**: All feature specifications, implementation plans, and code must be validated against these principles. Violations must be identified and resolved before proceeding with implementation.

**Versioning Policy**:
- MAJOR version: Backward incompatible principle removals or redefinitions
- MINOR version: New principle additions or materially expanded guidance
- PATCH version: Clarifications, wording improvements, typo fixes, non-semantic refinements

**Version**: 1.1.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
