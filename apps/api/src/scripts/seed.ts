/**
 * Idempotent seed script for HireLoop development and staging environments.
 * Seeds:
 * - Demo accounts (admin, recruiters, seekers)
 * - Seeker and Recruiter profiles
 * - 12 approved companies across diverse SaaS & tech industries
 * - 40 realistic job listings (active, closed, draft, featured)
 * - Sample candidate applications across all workflow statuses
 * - Saved jobs and in-app notifications
 *
 * Usage:
 *   npm run seed -w @hireloop/api
 */
import { loadEnv } from "../config/env.js";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import {
  UserModel,
  UserRoleModel,
  SeekerProfileModel,
  RecruiterProfileModel,
  CompanyModel,
  JobModel,
  ApplicationModel,
  SavedJobModel,
  NotificationModel,
  AuditLogModel,
} from "../models/index.js";
import { hashPassword } from "../services/password.service.js";
import { createLogger } from "../utils/logger.js";

async function seed(): Promise<void> {
  const env = loadEnv();
  const logger = createLogger(env.LOG_LEVEL);

  logger.info("Connecting to MongoDB for database seeding...");
  await connectDatabase({ uri: env.MONGODB_URI, logger });

  try {
    const passwordHash = await hashPassword("Password123!");

    // 1. Seed Users
    logger.info("Seeding demo users...");
    const demoUsers = [
      {
        fullName: "Sarah Connor (Admin)",
        email: "admin@hireloop.dev",
        role: "admin" as const,
      },
      {
        fullName: "Alex Mercer (Recruiter)",
        email: "recruiter@hireloop.dev",
        role: "recruiter" as const,
      },
      {
        fullName: "Elena Rostova (Recruiter)",
        email: "recruiter2@hireloop.dev",
        role: "recruiter" as const,
      },
      {
        fullName: "David Chen (Job Seeker)",
        email: "seeker@hireloop.dev",
        role: "seeker" as const,
      },
      {
        fullName: "Maya Lin (Job Seeker)",
        email: "seeker2@hireloop.dev",
        role: "seeker" as const,
      },
      {
        fullName: "James Wilson (Job Seeker)",
        email: "seeker3@hireloop.dev",
        role: "seeker" as const,
      },
    ];

    const userMap = new Map<string, any>();

    for (const u of demoUsers) {
      let userDoc = await UserModel.findOne({ email: u.email });
      if (!userDoc) {
        userDoc = await UserModel.create({
          fullName: u.fullName,
          email: u.email,
          passwordHash,
          status: "active",
          emailVerifiedAt: new Date(),
          authProviders: [{ provider: "password", providerUserId: null }],
        });
      }
      userMap.set(u.email, userDoc);

      await UserRoleModel.updateOne(
        { userId: userDoc._id, role: u.role },
        { $setOnInsert: { assignedBy: null } },
        { upsert: true },
      );
    }

    const recruiter1 = userMap.get("recruiter@hireloop.dev");
    const recruiter2 = userMap.get("recruiter2@hireloop.dev");
    const seeker1 = userMap.get("seeker@hireloop.dev");
    const seeker2 = userMap.get("seeker2@hireloop.dev");
    const seeker3 = userMap.get("seeker3@hireloop.dev");

    // 2. Seed Profiles
    logger.info("Seeding user profiles...");
    await SeekerProfileModel.updateOne(
      { userId: seeker1._id },
      {
        headline: "Senior Full-Stack Engineer | React, Node.js, TypeScript",
        bio: "Passionate developer with 6+ years designing scalable SaaS web architectures, microservices, and modern UX systems.",
        skills: ["React", "TypeScript", "Node.js", "MongoDB", "Docker", "Tailwind CSS"],
        location: "San Francisco, CA",
        phone: "+1 (555) 234-5678",
        profileCompleteness: 90,
      },
      { upsert: true },
    );

    await SeekerProfileModel.updateOne(
      { userId: seeker2._id },
      {
        headline: "AI & Machine Learning Engineer | Python, PyTorch, LLMs",
        bio: "Specializing in NLP, fine-tuning large language models, and high-performance vector retrieval architectures.",
        skills: ["Python", "PyTorch", "LangChain", "Vector DBs", "FastAPI", "Docker"],
        location: "New York, NY",
        phone: "+1 (555) 876-5432",
        profileCompleteness: 85,
      },
      { upsert: true },
    );

    await RecruiterProfileModel.updateOne(
      { userId: recruiter1._id },
      {
        jobTitle: "Head of Talent Acquisition",
        phone: "+1 (555) 901-2345",
      },
      { upsert: true },
    );

    await RecruiterProfileModel.updateOne(
      { userId: recruiter2._id },
      {
        jobTitle: "Senior Technical Recruiter",
        phone: "+1 (555) 432-1098",
      },
      { upsert: true },
    );

    // 3. Seed 12 Approved Companies
    logger.info("Seeding 12 approved companies...");
    const companiesData = [
      {
        name: "NeuralCraft AI",
        slug: "neuralcraft-ai",
        industry: "Artificial Intelligence",
        website: "https://neuralcraft.ai",
        location: "San Francisco, CA",
        employeeRange: "51-200",
        description: "Building next-generation generative AI workflows and fine-tuned LLM agents for enterprise automation.",
        ownerId: recruiter1._id,
      },
      {
        name: "PayPulse Technologies",
        slug: "paypulse-technologies",
        industry: "Fintech",
        website: "https://paypulse.io",
        location: "New York, NY",
        employeeRange: "201-500",
        description: "Modern global payout and automated reconciliation infrastructure for borderless commerce.",
        ownerId: recruiter1._id,
      },
      {
        name: "DevStack Systems",
        slug: "devstack-systems",
        industry: "Developer Tools",
        website: "https://devstack.io",
        location: "Seattle, WA",
        employeeRange: "11-50",
        description: "Developer tooling platform streamlining CI/CD pipelines, container orchestration, and telemetry.",
        ownerId: recruiter1._id,
      },
      {
        name: "CloudNova Cloud",
        slug: "cloudnova-cloud",
        industry: "Cloud Infrastructure",
        website: "https://cloudnova.dev",
        location: "Austin, TX",
        employeeRange: "501-1000",
        description: "Distributed edge serverless platform with zero-latency data replication worldwide.",
        ownerId: recruiter2._id,
      },
      {
        name: "HealthFirst Bio",
        slug: "healthfirst-bio",
        industry: "Healthcare",
        website: "https://healthfirst.bio",
        location: "Boston, MA",
        employeeRange: "51-200",
        description: "Digitizing personalized medicine and secure clinical trials through HIPAA-compliant AI.",
        ownerId: recruiter2._id,
      },
      {
        name: "ShopFlow Commerce",
        slug: "shopflow-commerce",
        industry: "E-Commerce",
        website: "https://shopflow.com",
        location: "Chicago, IL",
        employeeRange: "51-200",
        description: "Headless commerce architecture enabling rapid omnichannel store deployment.",
        ownerId: recruiter2._id,
      },
      {
        name: "CyberGuard Defense",
        slug: "cyberguard-defense",
        industry: "Cybersecurity",
        website: "https://cyberguard.sec",
        location: "Washington, DC",
        employeeRange: "201-500",
        description: "Automated threat intelligence and zero-trust perimeter enforcement for enterprise networks.",
        ownerId: recruiter1._id,
      },
      {
        name: "EduSphere Learning",
        slug: "edusphere-learning",
        industry: "Education",
        website: "https://edusphere.edu",
        location: "Toronto, Canada",
        employeeRange: "11-50",
        description: "Interactive STEM learning software and remote cohort training for engineers.",
        ownerId: recruiter1._id,
      },
      {
        name: "GreenPulse Energy",
        slug: "greenpulse-energy",
        industry: "CleanTech",
        website: "https://greenpulse.eco",
        location: "Denver, CO",
        employeeRange: "51-200",
        description: "Smart grid monitoring and renewable battery storage management software.",
        ownerId: recruiter2._id,
      },
      {
        name: "DataLoom Analytics",
        slug: "dataloom-analytics",
        industry: "Big Data",
        website: "https://dataloom.data",
        location: "London, UK",
        employeeRange: "51-200",
        description: "Real-time stream processing, lakehouse telemetry, and automated business analytics.",
        ownerId: recruiter2._id,
      },
      {
        name: "NexaStream Media",
        slug: "nexastream-media",
        industry: "Digital Media",
        website: "https://nexastream.media",
        location: "Los Angeles, CA",
        employeeRange: "11-50",
        description: "Low-latency video encoding and real-time interactive broadcast infrastructure.",
        ownerId: recruiter1._id,
      },
      {
        name: "QuantumCore Robotics",
        slug: "quantumcore-robotics",
        industry: "Robotics",
        website: "https://quantumcore.ai",
        location: "Pittsburgh, PA",
        employeeRange: "51-200",
        description: "Autonomous warehouse robotics and computer vision systems for logistics.",
        ownerId: recruiter2._id,
      },
    ];

    const companyMap = new Map<string, any>();
    for (const c of companiesData) {
      let comp = await CompanyModel.findOne({ slug: c.slug });
      if (!comp) {
        comp = await CompanyModel.create({
          ...c,
          status: "approved",
          submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          reviewedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        });
      }
      companyMap.set(c.slug, comp);
    }

    // 4. Seed 40 Realistic Job Listings
    logger.info("Seeding 40 realistic job listings...");
    const rawJobs = [
      // NeuralCraft AI
      {
        title: "Staff Machine Learning Engineer (LLMs)",
        slug: "staff-ml-engineer-llms",
        companySlug: "neuralcraft-ai",
        category: "Artificial Intelligence",
        jobType: "full-time" as const,
        salaryMin: 180000,
        salaryMax: 240000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "San Francisco",
        country: "USA",
        isRemote: true,
        isFeatured: true,
        status: "active" as const,
        skills: ["Python", "PyTorch", "Transformers", "CUDA", "LLMs"],
        description: "Join NeuralCraft AI to build and optimize enterprise-grade reasoning models.",
        responsibilities: "Architect distributed training pipelines, fine-tune models, and deploy low-latency inference.",
        requirements: "5+ years in ML/NLP with experience scaling large transformer models in production.",
        benefits: "Comprehensive health, 401k match, remote stipend, equity grant.",
      },
      {
        title: "Senior Full-Stack Engineer",
        slug: "senior-full-stack-engineer-ai",
        companySlug: "neuralcraft-ai",
        category: "Software Engineering",
        jobType: "full-time" as const,
        salaryMin: 150000,
        salaryMax: 195000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "San Francisco",
        country: "USA",
        isRemote: true,
        isFeatured: true,
        status: "active" as const,
        skills: ["React", "TypeScript", "Node.js", "Python", "Tailwind CSS"],
        description: "Create slick, responsive interfaces for our AI prompt canvas and evaluation pipelines.",
        responsibilities: "Collaborate with designers and ML engineers to ship intuitive generative interfaces.",
        requirements: "4+ years building high-traffic web applications with modern React and TypeScript.",
        benefits: "Full medical coverage, annual wellness fund, flexible vacation.",
      },
      {
        title: "AI Product Manager",
        slug: "ai-product-manager",
        companySlug: "neuralcraft-ai",
        category: "Product Management",
        jobType: "full-time" as const,
        salaryMin: 160000,
        salaryMax: 210000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "San Francisco",
        country: "USA",
        isRemote: false,
        isFeatured: false,
        status: "active" as const,
        skills: ["Product Strategy", "AI", "User Research", "Agile"],
        description: "Drive roadmap execution for our autonomous enterprise assistant products.",
        responsibilities: "Lead sprint planning, conduct customer interviews, and define KPIs.",
        requirements: "Proven track record launching SaaS or AI software products.",
        benefits: "Competitive salary, stock options, catered lunches.",
      },

      // PayPulse
      {
        title: "Principal Distributed Systems Engineer",
        slug: "principal-distributed-systems-engineer",
        companySlug: "paypulse-technologies",
        category: "Software Engineering",
        jobType: "full-time" as const,
        salaryMin: 190000,
        salaryMax: 260000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "New York",
        country: "USA",
        isRemote: true,
        isFeatured: true,
        status: "active" as const,
        skills: ["Go", "Distributed Systems", "Kafka", "PostgreSQL", "Kubernetes"],
        description: "Scale our global transaction ledger processing billions in monthly volume.",
        responsibilities: "Design fault-tolerant payment pipelines and implement atomic transaction ledgers.",
        requirements: "7+ years designing high-throughput distributed financial or backend systems.",
        benefits: "Health/dental/vision, 401(k), commuter benefits, generous equity.",
      },
      {
        title: "Senior Security Engineer (Fintech)",
        slug: "senior-security-engineer-fintech",
        companySlug: "paypulse-technologies",
        category: "Cybersecurity",
        jobType: "full-time" as const,
        salaryMin: 160000,
        salaryMax: 210000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "New York",
        country: "USA",
        isRemote: false,
        isFeatured: false,
        status: "active" as const,
        skills: ["PCI-DSS", "AppSec", "Cloud Security", "SOC2", "Penetration Testing"],
        description: "Safeguard user financial credentials and ensure strict regulatory compliance.",
        responsibilities: "Perform vulnerability assessments, threat modeling, and incident response.",
        requirements: "Deep understanding of payment security standards, cryptography, and cloud hardening.",
        benefits: "Top-tier health benefits, gym membership, annual tech allowance.",
      },
      {
        title: "Technical Account Manager",
        slug: "technical-account-manager-paypulse",
        companySlug: "paypulse-technologies",
        category: "Sales",
        jobType: "full-time" as const,
        salaryMin: 110000,
        salaryMax: 145000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "New York",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["APIs", "Customer Success", "Fintech", "SQL"],
        description: "Partner with enterprise clients to integrate PayPulse APIs seamlessly.",
        responsibilities: "Provide architectural guidance and accelerate merchant onboarding.",
        requirements: "3+ years in solutions engineering or technical account management.",
        benefits: "Bonus potential, paid parental leave, flexible hours.",
      },

      // DevStack Systems
      {
        title: "Senior DevOps / SRE Engineer",
        slug: "senior-devops-sre-devstack",
        companySlug: "devstack-systems",
        category: "DevOps",
        jobType: "full-time" as const,
        salaryMin: 155000,
        salaryMax: 200000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Seattle",
        country: "USA",
        isRemote: true,
        isFeatured: true,
        status: "active" as const,
        skills: ["Terraform", "Kubernetes", "AWS", "Prometheus", "CI/CD"],
        description: "Maintain 99.99% availability for developer environments and container clusters.",
        responsibilities: "Manage infrastructure as code and implement automated incident remediation.",
        requirements: "4+ years maintaining multi-cloud infrastructure and monitoring systems.",
        benefits: "Home office budget, health insurance, conference travel stipend.",
      },
      {
        title: "Frontend Architect",
        slug: "frontend-architect-devstack",
        companySlug: "devstack-systems",
        category: "Software Engineering",
        jobType: "full-time" as const,
        salaryMin: 165000,
        salaryMax: 215000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Seattle",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["React", "TypeScript", "Vite", "Design Systems", "Web Performance"],
        description: "Own the UI design system and micro-frontend architecture for all developer consoles.",
        responsibilities: "Establish frontend standards, maintain component libraries, and optimize bundle sizes.",
        requirements: "Extensive experience crafting accessible, high-performance web applications.",
        benefits: "Flexible vacation, education stipend, full medical/dental.",
      },

      // CloudNova
      {
        title: "Cloud Infrastructure Architect",
        slug: "cloud-infrastructure-architect-cloudnova",
        companySlug: "cloudnova-cloud",
        category: "Cloud Infrastructure",
        jobType: "full-time" as const,
        salaryMin: 175000,
        salaryMax: 230000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Austin",
        country: "USA",
        isRemote: true,
        isFeatured: true,
        status: "active" as const,
        skills: ["Rust", "eBPF", "Edge Computing", "Networking", "Linux"],
        description: "Design edge routing and high-throughput serverless sandboxes.",
        responsibilities: "Optimize kernel network bypass and virtual machine startup times.",
        requirements: "Deep systems programming experience in Rust or C++.",
        benefits: "Generous equity, premium health coverage, 401(k) matching.",
      },
      {
        title: "Developer Relations Engineer",
        slug: "developer-relations-engineer-cloudnova",
        companySlug: "cloudnova-cloud",
        category: "Marketing",
        jobType: "full-time" as const,
        salaryMin: 130000,
        salaryMax: 170000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Austin",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["Technical Writing", "Public Speaking", "JavaScript", "Sample Apps"],
        description: "Champion the developer community, write documentation, and speak at tech summits.",
        responsibilities: "Create open-source templates and collect feedback from edge developers.",
        requirements: "Strong communication and full-stack software development background.",
        benefits: "Global travel stipend, flexible schedule, health benefits.",
      },

      // HealthFirst Bio
      {
        title: "Bioinformatics Data Scientist",
        slug: "bioinformatics-data-scientist-healthfirst",
        companySlug: "healthfirst-bio",
        category: "Data Science",
        jobType: "full-time" as const,
        salaryMin: 140000,
        salaryMax: 185000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Boston",
        country: "USA",
        isRemote: false,
        isFeatured: false,
        status: "active" as const,
        skills: ["Python", "R", "Genomics", "Statistics", "Machine Learning"],
        description: "Analyze clinical trial sequencing data to discover personalized drug targets.",
        responsibilities: "Build statistical models for biomarker identification.",
        requirements: "Ph.D. or Master's in Bioinformatics, Computational Biology, or related field.",
        benefits: "401(k) matching, transit pass, fertility benefits, health coverage.",
      },
      {
        title: "Healthcare Compliance Specialist",
        slug: "healthcare-compliance-specialist",
        companySlug: "healthfirst-bio",
        category: "Cybersecurity",
        jobType: "full-time" as const,
        salaryMin: 105000,
        salaryMax: 140000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Boston",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["HIPAA", "FDA Guidelines", "Data Privacy", "Auditing"],
        description: "Ensure software clinical tools adhere to international regulatory health standards.",
        responsibilities: "Audit data handling protocols and prepare submission filings.",
        requirements: "Knowledge of medical device software regulations and privacy laws.",
        benefits: "Health insurance, generous PTO, ongoing education support.",
      },

      // ShopFlow Commerce
      {
        title: "Senior React Native Mobile Engineer",
        slug: "senior-react-native-mobile-engineer",
        companySlug: "shopflow-commerce",
        category: "Software Engineering",
        jobType: "full-time" as const,
        salaryMin: 145000,
        salaryMax: 190000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Chicago",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["React Native", "iOS", "Android", "TypeScript", "GraphQL"],
        description: "Build high-conversion mobile storefronts for top global retail brands.",
        responsibilities: "Develop seamless checkout flows and native performance optimizations.",
        requirements: "4+ years shipping production React Native applications on App Store and Google Play.",
        benefits: "Medical, dental, vision, hardware stipend, parental leave.",
      },
      {
        title: "Senior Product Designer (UI/UX)",
        slug: "senior-product-designer-shopflow",
        companySlug: "shopflow-commerce",
        category: "Design",
        jobType: "full-time" as const,
        salaryMin: 135000,
        salaryMax: 175000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Chicago",
        country: "USA",
        isRemote: true,
        isFeatured: true,
        status: "active" as const,
        skills: ["Figma", "Design Systems", "Prototyping", "User Research", "E-Commerce"],
        description: "Craft modern, accessible, and delightful merchant dashboard experiences.",
        responsibilities: "Conduct usability sessions, build component tokens, and partner with frontend teams.",
        requirements: "Strong portfolio demonstrating complex B2B SaaS or commerce design projects.",
        benefits: "Competitive salary, 401(k), paid company retreats, wellness stipend.",
      },

      // CyberGuard Defense
      {
        title: "Lead Threat Intelligence Analyst",
        slug: "lead-threat-intelligence-analyst",
        companySlug: "cyberguard-defense",
        category: "Cybersecurity",
        jobType: "full-time" as const,
        salaryMin: 150000,
        salaryMax: 200000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Washington",
        country: "USA",
        isRemote: false,
        isFeatured: true,
        status: "active" as const,
        skills: ["Threat Hunting", "OSINT", "Malware Analysis", "SIEM", "Python"],
        description: "Track advanced persistent threat actors and build early-warning detection rules.",
        responsibilities: "Analyze malware telemetry and publish defensive advisory reports.",
        requirements: "5+ years in security operations or threat intelligence research.",
        benefits: "Top secret clearance bonus, retirement matching, comprehensive healthcare.",
      },
      {
        title: "Enterprise Solutions Architect",
        slug: "enterprise-solutions-architect-cyberguard",
        companySlug: "cyberguard-defense",
        category: "Sales",
        jobType: "full-time" as const,
        salaryMin: 160000,
        salaryMax: 215000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Washington",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["Zero Trust", "Cloud Architecture", "Sales Engineering", "Networking"],
        description: "Guide Fortune 500 security leaders in adopting CyberGuard's zero-trust platform.",
        responsibilities: "Lead proof-of-concept deployments and technical security evaluations.",
        requirements: "Strong enterprise pre-sales engineering track record in cybersecurity.",
        benefits: "Uncapped sales commission, health benefits, executive coaching.",
      },

      // EduSphere Learning
      {
        title: "Lead Curriculum Engineer (Computer Science)",
        slug: "lead-curriculum-engineer-edusphere",
        companySlug: "edusphere-learning",
        category: "Education",
        jobType: "full-time" as const,
        salaryMin: 120000,
        salaryMax: 160000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Toronto",
        country: "Canada",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["Algorithms", "Interactive Learning", "Python", "Pedagogy"],
        description: "Design interactive coding sandboxes and project-based software curriculums.",
        responsibilities: "Write automated grading tests and author comprehensive CS lessons.",
        requirements: "Background in software engineering combined with teaching or technical content creation.",
        benefits: "Flexible hours, learning budget, full dental/health benefits.",
      },
      {
        title: "Full-Stack Web Developer",
        slug: "full-stack-web-developer-edusphere",
        companySlug: "edusphere-learning",
        category: "Software Engineering",
        jobType: "full-time" as const,
        salaryMin: 105000,
        salaryMax: 140000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Toronto",
        country: "Canada",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
        description: "Build engaging student learning dashboards and live interactive classrooms.",
        responsibilities: "Implement real-time WebSockets collaboration tools and responsive pages.",
        requirements: "3+ years in full-stack web development.",
        benefits: "Home office budget, generous vacation, employee discounts.",
      },

      // GreenPulse Energy
      {
        title: "Embedded Systems Engineer (IoT)",
        slug: "embedded-systems-engineer-greenpulse",
        companySlug: "greenpulse-energy",
        category: "CleanTech",
        jobType: "full-time" as const,
        salaryMin: 130000,
        salaryMax: 175000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Denver",
        country: "USA",
        isRemote: false,
        isFeatured: false,
        status: "active" as const,
        skills: ["C/C++", "FreeRTOS", "IoT", "Modbus", "Hardware"],
        description: "Develop firmware for battery storage management and solar inverter gateways.",
        responsibilities: "Write reliable, low-power firmware for industrial energy controllers.",
        requirements: "Experience with microcontrollers, bus protocols, and hardware debugging.",
        benefits: "Eco-transit pass, 401(k), outdoor gear discounts, health coverage.",
      },
      {
        title: "Clean Energy Data Analyst",
        slug: "clean-energy-data-analyst",
        companySlug: "greenpulse-energy",
        category: "Data Science",
        jobType: "full-time" as const,
        salaryMin: 95000,
        salaryMax: 130000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Denver",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["SQL", "Tableau", "Python", "Energy Modeling"],
        description: "Model grid supply and demand forecasting to maximize battery efficiency.",
        responsibilities: "Build executive dashboards and evaluate carbon reduction metrics.",
        requirements: "Analytical background with strong SQL and visualization expertise.",
        benefits: "Health/vision/dental, carbon-offset stipend, flexible schedule.",
      },

      // DataLoom Analytics
      {
        title: "Staff Data Platform Engineer",
        slug: "staff-data-platform-engineer-dataloom",
        companySlug: "dataloom-analytics",
        category: "Big Data",
        jobType: "full-time" as const,
        salaryMin: 165000,
        salaryMax: 220000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "London",
        country: "UK",
        isRemote: true,
        isFeatured: true,
        status: "active" as const,
        skills: ["Apache Spark", "Flink", "Delta Lake", "Python", "Kubernetes"],
        description: "Build real-time stream processing engines handling petabytes of daily telemetry.",
        responsibilities: "Optimize streaming query latency and manage scalable data lakehouses.",
        requirements: "6+ years with distributed big data processing frameworks.",
        benefits: "Private healthcare, pension matching, remote working allowance.",
      },
      {
        title: "Customer Support Engineer",
        slug: "customer-support-engineer-dataloom",
        companySlug: "dataloom-analytics",
        category: "Sales",
        jobType: "full-time" as const,
        salaryMin: 75000,
        salaryMax: 100000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "London",
        country: "UK",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["SQL", "REST APIs", "Debugging", "Customer Support"],
        description: "Help enterprise data engineers troubleshoot query bottlenecks and API errors.",
        responsibilities: "Respond to technical inquiries and file bug reports with engineering.",
        requirements: "Strong problem solving skills and familiarity with database queries.",
        benefits: "Cycle-to-work scheme, health coverage, generous holiday allowance.",
      },

      // NexaStream Media
      {
        title: "Video Streaming Protocol Engineer",
        slug: "video-streaming-protocol-engineer",
        companySlug: "nexastream-media",
        category: "Software Engineering",
        jobType: "full-time" as const,
        salaryMin: 160000,
        salaryMax: 210000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Los Angeles",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["WebRTC", "HLS", "FFmpeg", "C++", "Go"],
        description: "Engineer ultra-low latency interactive live video streaming backends.",
        responsibilities: "Optimize video chunk packetization and adaptive bitrate algorithms.",
        requirements: "Experience with real-time video protocols and media server engineering.",
        benefits: "Streaming subscriptions, medical/dental, catered office snacks.",
      },

      // QuantumCore Robotics
      {
        title: "Computer Vision Scientist (Robotics)",
        slug: "computer-vision-scientist-robotics",
        companySlug: "quantumcore-robotics",
        category: "Artificial Intelligence",
        jobType: "full-time" as const,
        salaryMin: 175000,
        salaryMax: 235000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Pittsburgh",
        country: "USA",
        isRemote: false,
        isFeatured: true,
        status: "active" as const,
        skills: ["OpenCV", "ROS", "3D Perception", "PyTorch", "C++"],
        description: "Develop 3D spatial perception and real-time obstacle avoidance for mobile robots.",
        responsibilities: "Deploy object detection models on edge robotic compute hardware.",
        requirements: "Ph.D. or Master's in Computer Science, Robotics, or Computer Vision.",
        benefits: "Relocation assistance, 401(k), full healthcare, gym membership.",
      },

      // Additional active, closed & draft jobs across companies
      {
        title: "Senior Product Marketing Manager",
        slug: "senior-product-marketing-manager-nc",
        companySlug: "neuralcraft-ai",
        category: "Marketing",
        jobType: "full-time" as const,
        salaryMin: 140000,
        salaryMax: 180000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "San Francisco",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["Go-to-Market", "Positioning", "SaaS", "Content Strategy"],
        description: "Lead positioning, launches, and customer case studies for new AI model capabilities.",
        responsibilities: "Execute product launches and create compelling sales collateral.",
        requirements: "4+ years in B2B tech product marketing.",
        benefits: "Full medical, equity, unlimited PTO.",
      },
      {
        title: "Junior QA Automation Engineer",
        slug: "junior-qa-automation-engineer-paypulse",
        companySlug: "paypulse-technologies",
        category: "Software Engineering",
        jobType: "full-time" as const,
        salaryMin: 85000,
        salaryMax: 110000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "New York",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["Playwright", "TypeScript", "Jest", "CI/CD"],
        description: "Automate end-to-end regression test suites for payments checkout and merchant portals.",
        responsibilities: "Write automated tests and monitor build pipeline test stability.",
        requirements: "1+ year experience with JavaScript/TypeScript automated testing.",
        benefits: "Mentorship program, health benefits, learning stipend.",
      },
      {
        title: "Growth Marketing Specialist",
        slug: "growth-marketing-specialist-shopflow",
        companySlug: "shopflow-commerce",
        category: "Marketing",
        jobType: "full-time" as const,
        salaryMin: 90000,
        salaryMax: 125000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Chicago",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["SEO", "Performance Marketing", "Google Ads", "Analytics"],
        description: "Scale organic acquisition and paid campaigns across search and social channels.",
        responsibilities: "Manage ad spend budgets, run A/B tests, and optimize funnels.",
        requirements: "Demonstrated success driving B2B SaaS lead acquisition.",
        benefits: "Health/dental, hybrid remote flexibility, wellness credits.",
      },
      {
        title: "Lead Cloud Security Architect",
        slug: "lead-cloud-security-architect-cyberguard",
        companySlug: "cyberguard-defense",
        category: "Cybersecurity",
        jobType: "full-time" as const,
        salaryMin: 180000,
        salaryMax: 240000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Washington",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["AWS", "Azure", "IAM", "Kubernetes Security", "Zero Trust"],
        description: "Define enterprise reference architectures for secure multi-tenant cloud migrations.",
        responsibilities: "Conduct cloud architecture reviews and implement guardrails.",
        requirements: "Extensive cloud security experience with relevant certifications (CISSP, CCSP).",
        benefits: "Premium health, 401(k) matching, annual bonus.",
      },
      {
        title: "Senior Technical Writer",
        slug: "senior-technical-writer-devstack",
        companySlug: "devstack-systems",
        category: "Product Management",
        jobType: "full-time" as const,
        salaryMin: 115000,
        salaryMax: 150000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Seattle",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["Markdown", "API Documentation", "Git", "Developer Docs"],
        description: "Author crystal-clear developer guides, SDK reference docs, and tutorials.",
        responsibilities: "Collaborate with engineers to document APIs and command-line tools.",
        requirements: "Portfolio of technical documentation for developer audiences.",
        benefits: "Home office setup, health benefits, flexible hours.",
      },
      {
        title: "Frontend Engineering Intern",
        slug: "frontend-engineering-intern-edusphere",
        companySlug: "edusphere-learning",
        category: "Software Engineering",
        jobType: "internship" as const,
        salaryMin: 60000,
        salaryMax: 75000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Toronto",
        country: "Canada",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["HTML", "CSS", "JavaScript", "React"],
        description: "12-week summer internship learning modern React, component architecture, and accessibility.",
        responsibilities: "Build UI components, fix accessibility bugs, and write unit tests.",
        requirements: "Enrolled in or recently graduated from Computer Science or equivalent bootcamp.",
        benefits: "Paid internship, 1-on-1 mentorship, potential return offer.",
      },
      {
        title: "Senior Backend Engineer (Contract)",
        slug: "senior-backend-engineer-contract-paypulse",
        companySlug: "paypulse-technologies",
        category: "Software Engineering",
        jobType: "contract" as const,
        salaryMin: 130000,
        salaryMax: 170000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "New York",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "active" as const,
        skills: ["Node.js", "Express", "PostgreSQL", "Stripe API"],
        description: "6-month contract helping integrate additional European payment methods.",
        responsibilities: "Implement localized payment flows and automated test coverage.",
        requirements: "3+ years building Node.js backend integrations.",
        benefits: "Competitive hourly rate, flexible remote terms.",
      },

      // Closed Jobs (Completed/Filled)
      {
        title: "Staff Data Engineer (Filled)",
        slug: "staff-data-engineer-filled",
        companySlug: "paypulse-technologies",
        category: "Big Data",
        jobType: "full-time" as const,
        salaryMin: 170000,
        salaryMax: 220000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "New York",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "closed" as const,
        skills: ["Python", "Snowflake", "dbt"],
        description: "Position has been filled.",
        responsibilities: "Role filled.",
        requirements: "Role filled.",
        benefits: "Role filled.",
      },
      {
        title: "Product Marketing Associate (Closed)",
        slug: "product-marketing-associate-closed",
        companySlug: "neuralcraft-ai",
        category: "Marketing",
        jobType: "full-time" as const,
        salaryMin: 75000,
        salaryMax: 95000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "San Francisco",
        country: "USA",
        isRemote: false,
        isFeatured: false,
        status: "closed" as const,
        skills: ["Marketing", "Social Media"],
        description: "Position has been closed.",
        responsibilities: "Position closed.",
        requirements: "Position closed.",
        benefits: "Position closed.",
      },
      {
        title: "DevOps Engineer (Closed)",
        slug: "devops-engineer-closed-dataloom",
        companySlug: "dataloom-analytics",
        category: "DevOps",
        jobType: "full-time" as const,
        salaryMin: 130000,
        salaryMax: 165000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "London",
        country: "UK",
        isRemote: true,
        isFeatured: false,
        status: "closed" as const,
        skills: ["Docker", "Linux"],
        description: "Position has been closed.",
        responsibilities: "Position closed.",
        requirements: "Position closed.",
        benefits: "Position closed.",
      },

      // Draft Jobs (Internal Preparation)
      {
        title: "Head of AI Research (Draft)",
        slug: "head-of-ai-research-draft",
        companySlug: "neuralcraft-ai",
        category: "Artificial Intelligence",
        jobType: "full-time" as const,
        salaryMin: 250000,
        salaryMax: 350000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "San Francisco",
        country: "USA",
        isRemote: false,
        isFeatured: false,
        status: "draft" as const,
        skills: ["Research", "Leadership", "PyTorch"],
        description: "Draft role in review.",
        responsibilities: "Draft responsibilities.",
        requirements: "Draft requirements.",
        benefits: "Draft benefits.",
      },
      {
        title: "VP of People & Culture (Draft)",
        slug: "vp-people-culture-draft",
        companySlug: "shopflow-commerce",
        category: "Product Management",
        jobType: "full-time" as const,
        salaryMin: 180000,
        salaryMax: 240000,
        currency: "USD",
        salaryPeriod: "yearly",
        city: "Chicago",
        country: "USA",
        isRemote: true,
        isFeatured: false,
        status: "draft" as const,
        skills: ["HR", "Recruiting", "Culture"],
        description: "Draft leadership position.",
        responsibilities: "Draft responsibilities.",
        requirements: "Draft requirements.",
        benefits: "Draft benefits.",
      },
    ];

    const savedJobDocs = new Map<string, any>();
    const now = new Date();
    const futureDeadline = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    for (const j of rawJobs) {
      const company = companyMap.get(j.companySlug);
      if (!company) continue;

      let jobDoc = await JobModel.findOne({ slug: j.slug });
      if (!jobDoc) {
        jobDoc = await JobModel.create({
          companyId: company._id,
          recruiterId: company.ownerId,
          title: j.title,
          slug: j.slug,
          category: j.category,
          skills: j.skills,
          jobType: j.jobType,
          salaryMin: j.salaryMin,
          salaryMax: j.salaryMax,
          currency: j.currency,
          salaryPeriod: j.salaryPeriod,
          city: j.city,
          country: j.country,
          isRemote: j.isRemote,
          deadline: futureDeadline,
          description: j.description,
          responsibilities: j.responsibilities,
          requirements: j.requirements,
          benefits: j.benefits,
          status: j.status,
          isFeatured: j.isFeatured,
          publishedAt: j.status === "active" ? new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) : null,
        });
      }
      savedJobDocs.set(j.slug, jobDoc);
    }

    // 5. Seed Candidate Applications in various stages
    logger.info("Seeding candidate applications...");
    const targetJob1 = savedJobDocs.get("staff-ml-engineer-llms");
    const targetJob2 = savedJobDocs.get("senior-full-stack-engineer-ai");
    const targetJob3 = savedJobDocs.get("principal-distributed-systems-engineer");
    const targetJob4 = savedJobDocs.get("senior-devops-sre-devstack");
    const targetJob5 = savedJobDocs.get("senior-product-designer-shopflow");

    if (targetJob1 && seeker1) {
      await ApplicationModel.updateOne(
        { jobId: targetJob1._id, seekerId: seeker1._id },
        {
          coverLetter: "I have over 6 years of experience building modern web architectures and AI pipelines. Looking forward to discussing the role!",
          status: "shortlisted",
          interviewAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
          recruiterNotes: "Strong candidate with comprehensive TypeScript and React background.",
        },
        { upsert: true },
      );
    }

    if (targetJob2 && seeker1) {
      await ApplicationModel.updateOne(
        { jobId: targetJob2._id, seekerId: seeker1._id },
        {
          coverLetter: "Excited by NeuralCraft's mission to reinvent enterprise automation with generative interfaces.",
          status: "under_review",
        },
        { upsert: true },
      );
    }

    if (targetJob3 && seeker1) {
      await ApplicationModel.updateOne(
        { jobId: targetJob3._id, seekerId: seeker1._id },
        {
          coverLetter: "Passionate about building fault-tolerant distributed transaction systems.",
          status: "applied",
        },
        { upsert: true },
      );
    }

    if (targetJob1 && seeker2) {
      await ApplicationModel.updateOne(
        { jobId: targetJob1._id, seekerId: seeker2._id },
        {
          coverLetter: "My background in NLP and fine-tuning open source LLMs aligns directly with your mission.",
          status: "offered",
          recruiterNotes: "Passed technical architecture round with distinction. Offer issued.",
        },
        { upsert: true },
      );
    }

    if (targetJob4 && seeker3) {
      await ApplicationModel.updateOne(
        { jobId: targetJob4._id, seekerId: seeker3._id },
        {
          coverLetter: "Experienced with Kubernetes and automated observability platforms.",
          status: "rejected",
          recruiterNotes: "Candidate looking for full remote only.",
        },
        { upsert: true },
      );
    }

    // 6. Seed Saved Jobs
    logger.info("Seeding saved jobs...");
    if (seeker1) {
      const toSave = [targetJob1, targetJob2, targetJob4, targetJob5].filter(Boolean);
      for (const j of toSave) {
        await SavedJobModel.updateOne(
          { seekerId: seeker1._id, jobId: j._id },
          { $setOnInsert: { createdAt: new Date() } },
          { upsert: true },
        );
      }
    }

    // 7. Seed Notifications
    logger.info("Seeding notifications...");
    if (seeker1) {
      await NotificationModel.create([
        {
          userId: seeker1._id,
          type: "interview_scheduled",
          title: "Interview Scheduled",
          body: "NeuralCraft AI has scheduled an interview for Staff Machine Learning Engineer.",
          link: "/dashboard/seeker/applications",
          readAt: null,
        },
        {
          userId: seeker1._id,
          type: "application_status_changed",
          title: "Application Shortlisted",
          body: "Your application for Staff Machine Learning Engineer has been shortlisted!",
          link: "/dashboard/seeker/applications",
          readAt: new Date(),
        },
        {
          userId: seeker1._id,
          type: "application_submitted",
          title: "Application Received",
          body: "You successfully applied for Senior Full-Stack Engineer at NeuralCraft AI.",
          link: "/dashboard/seeker/applications",
          readAt: new Date(),
        },
      ]);
    }

    if (recruiter1) {
      await NotificationModel.create([
        {
          userId: recruiter1._id,
          type: "company_approved",
          title: "Organization Verified",
          body: "NeuralCraft AI has been reviewed and approved by HireLoop moderation.",
          link: "/dashboard/recruiter/company",
          readAt: new Date(),
        },
        {
          userId: recruiter1._id,
          type: "application_submitted",
          title: "New Candidate Application",
          body: "David Chen submitted an application for Staff Machine Learning Engineer.",
          link: "/dashboard/recruiter/jobs",
          readAt: null,
        },
      ]);
    }

    logger.info("✅ Database successfully seeded with demo accounts, companies, jobs, applications, and notifications!");
    logger.info("Demo Account Credentials:");
    logger.info("  Administrator: admin@hireloop.dev    / Password123!");
    logger.info("  Recruiter:     recruiter@hireloop.dev/ Password123!");
    logger.info("  Job Seeker:    seeker@hireloop.dev   / Password123!");
  } finally {
    await disconnectDatabase();
  }
}

seed().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Seed failed: ${message}`);
  process.exit(1);
});

