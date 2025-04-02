MAKAO RENTAL MANAGEMENT SYSTEM - IMPLEMENTATION INSTRUCTIONS
Table of Contents
System Overview
Admin Dashboard
Tenant Dashboard
SMS Notifications with Africa's Talking API
Payment Management
Email Notifications
Reminders System
Tenant Requests
House Deposit Refund System
Renovation Tracking
Room Creation and Allocation
Technology Stack
Implementation Timeline
System Overview
MAKAO is a comprehensive rental property management system designed to streamline the administration of rental properties, improve communication between property managers and tenants, and automate key processes such as payments, notifications, and maintenance requests.

Admin Dashboard
Key Features
Property Overview: Display total properties, occupied units, vacancy rates, and monthly revenue
Tenant Management:
View all tenants with search and filter options
Tenant profile details (contact info, payment history, lease terms)
Tenant status indicators (active, late payment, pending eviction)
Tenant document storage (contracts, ID copies)
Financial Dashboard:
Monthly revenue tracking
Payment status overview
Outstanding balances
Payment verification interface
Financial reports generation
Property Management:
Add/edit/delete property units
Maintenance scheduling
Renovation tracking for vacant units
Occupancy statistics
Notification Center:
Template management for all notification types
Manual notification sending interface
Notification history log
Admin Settings:
User role management
System configuration
Audit logs
UI Design
Clean, professional interface with dark/light mode
Mobile-responsive layout
Data visualization with charts and graphs
Tabbed navigation for different sections
Quick action buttons for common tasks
Tenant Dashboard
Key Features
Personal Profile:
View and update personal information
Emergency contact details
Vehicle information
Lease Information:
Contract details and download option
Lease start/end dates
Renewal options
Payment Interface:
Current and past invoices
Payment upload section with form
Payment history with downloadable receipts
Outstanding balance and due dates
Maintenance Requests:
Submit new maintenance requests
Track status of existing requests
Upload photos of issues
Communication thread with management
Notifications:
Important announcements
Payment reminders
Maintenance updates
UI Design
User-friendly interface with intuitive navigation
Mobile-first design for on-the-go access
Prominent display of important dates and amounts due
Clear status indicators for payments and requests
SMS Notifications with Africa's Talking API
Implementation Steps
API Integration:
Set up Africa's Talking account
Obtain API credentials
Create secure environment variables
Implement authentication
SMS Service:
Create a dedicated SMS service module
Implement SMS sending functions
Set up SMS templates for different notification types
Add phone number validation
SMS Notification Types:
Payment reminders (7 days before due date, day of due date)
Payment confirmation
Payment overdue notices
Maintenance request updates
Lease renewal reminders
Penalty notifications
Eviction notices
Admin Controls:
Enable/disable specific notification types
Customize message templates
Set notification schedules
View SMS delivery reports
Error Handling:
Implement retry logic for failed messages
Log delivery failures
Notify admins of persistent failures
Payment Management
Features
Payment Upload System:
Form for tenants to upload payment details
Support for M-Pesa and card payments
Required fields: transaction ID, amount, date, payment method
File upload for payment screenshots/receipts
Submission confirmation
Admin Verification Process:
Notification of new payment submissions
Verification interface with uploaded details and files
Approve/reject options with reason field
Batch processing capabilities for multiple payments
Payment Status Tracking:
Pending verification
Approved
Rejected (with reason)
Partially approved
Automated Receipt Generation:
PDF receipt generation upon approval
Company branding and details
Payment information and confirmation
Automatic emailing to tenant
Payment Analytics:
On-time payment statistics
Payment method preferences
Monthly/yearly collection trends
Email Notifications
Implementation
Email Service Setup:
Configure SMTP server or email service (SendGrid, Mailgun, etc.)
Create HTML email templates with responsive design
Set up environment variables for email configuration
Email Notification Types:
Welcome email with account details
Payment confirmation and receipts
Payment reminders
Late payment notices
Maintenance request updates
Lease renewal information
Eviction notices
General announcements
Email Template System:
Create reusable components for email templates
Dynamic content insertion
Branded headers and footers
Mobile-responsive design
Reminders System
Features
Deadline Reminders:
Rent due date reminders (7 days before, 3 days before, day of)
Lease expiration reminders (30 days, 14 days before)
Document submission deadlines
Scheduled maintenance reminders
Penalty Reminders:
Late payment penalty notifications
Escalating reminder series (first notice, second notice)
Grace period notifications
Payment plan options
Eviction Notice System:
Multi-stage notification process
Legal compliance with local regulations
Clear payment requirements to avoid eviction
Documentation of all notices sent
Scheduling Engine:
Cron job setup for automated reminders
Custom scheduling rules
Timezone handling
Holiday-aware scheduling
Tenant Requests
Features
Request Types:
Maintenance/repairs
Amenity access
Lease modifications
Permission requests (painting, modifications)
General inquiries
Request Submission Process:
Category selection
Priority level
Description field
Photo/document attachments
Contact preference
Request Tracking:
Unique request ID
Status updates (submitted, in review, scheduled, in progress, completed)
Expected timeline
Assigned staff member
Communication Thread:
In-system messaging about the request
Response notifications
Resolution confirmation
House Deposit Refund
Implementation
Move-out Inspection Process:
Digital inspection form
Photo documentation
Tenant signature capability
Damage assessment
Damage Cost Calculation:
Itemized list of damages
Cost breakdown
Reference to lease terms
Before/after photo comparisons
Deposit Calculation:
Original deposit amount
Itemized deductions
Final refund amount
Approval workflow
Refund Processing:
Payment method selection
Transaction recording
Receipt generation
Dispute resolution process
Renovation Tracking
Features
Vacant Unit Management:
Automatic flagging of vacant units
Vacancy duration tracking
Revenue loss calculation
Renovation Planning:
Scope of work definition
Budget allocation
Contractor assignment
Timeline creation
Renovation Progress Tracking:
Task completion checklist
Progress photos
Expense tracking against budget
Timeline updates
Post-Renovation Process:
Final inspection
Updated property photos
Rental listing update
New rental rate calculation
Room Creation and Allocation
Features
Room Creation Interface:
Property/building selection
Room details (size, features, floor)
Rent amount and deposit requirements
Utility inclusion settings
Photo upload
Tenant Allocation Process:
Applicant selection
Lease term specification
Move-in date setting
Initial payment recording
Automatic Contract Generation:
Dynamic contract template system
Tenant and property data insertion
Digital signature capability
PDF generation and storage
Email delivery to tenant
Rent Payment Details Communication:
Payment methods information
Due dates
Late payment policies
First payment instructions
Technology Stack
Current Stack
Next.js 15.2.4
React 19.1.0
TypeScript
Tailwind CSS
Supabase for backend and authentication
Clerk for user management
Additional Technologies to Implement
Africa's Talking API for SMS
Email service provider (SendGrid or similar)
PDF generation library (jsPDF or similar)
Payment gateway integration
File storage solution (Supabase Storage or similar)
Cron job service for scheduled tasks
Implementation Timeline
Phase 1: Core Infrastructure (Weeks 1-2)
Set up database schema for all new features
Implement authentication and role-based access
Create base layouts for admin and tenant dashboards
Phase 2: Dashboard Development (Weeks 3-4)
Build admin dashboard with property management features
Develop tenant dashboard with profile and lease information
Implement responsive design and navigation
Phase 3: Payment System (Weeks 5-6)
Create payment upload interface for tenants
Develop admin verification system
Implement receipt generation and email delivery
Phase 4: Communication Systems (Weeks 7-8)
Integrate Africa's Talking API for SMS
Set up email notification system
Develop tenant request system
Phase 5: Automation Features (Weeks 9-10)
Implement reminder scheduling system
Create automatic contract generation
Develop deposit refund calculation system
Phase 6: Testing and Refinement (Weeks 11-12)
Comprehensive testing of all features
UI/UX refinements
Performance optimization
Security audit
Borrowed Features from Bahari Hotel Booking App
Booking Flow Adaptation
Adapt the step-based flow: Room Selection → Tenant Details → Payment Details
Implement loading states for all actions
Add progress indicators for multi-step processes
Include booking/lease summaries at each step
UI/UX Enhancements
Incorporate responsive design principles
Add proper loading states for all actions
Implement visual feedback for user actions
Use modern UI components with consistent styling
Technical Implementations
Leverage Next.js Image components with unoptimized property
Configure email templates following Bahari Hotel's pattern
Implement the same secure payment verification process
Adapt the confirmation and receipt systems
This instruction document serves as a comprehensive roadmap for implementing the MAKAO rental management system. Each section provides detailed guidance on the features, implementation approach, and technical considerations.