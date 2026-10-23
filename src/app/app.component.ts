import { Component, HostListener, AfterViewInit, OnDestroy } from '@angular/core';

interface DayEntry {
  n: number;
  t: string;
  lab: string;
  hw: string;
  q: string;
  tp?: string;
  hidden?: boolean;
  open?: boolean;
}

interface PhaseEntry {
  name: string;
  from: number;
  to: number;
  goal: string;
  days: DayEntry[];
  open: boolean;
  hidden?: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  siteName = 'TechUp Academy';
  tagline = 'Learn. Build. Grow.';
  email = 'akhil.tech365@gmail.com';
  year = new Date().getFullYear();

  navOpen = false;
  showBackToTop = false;
  searchQuery = '';
  activeSection = 'home';
  private sectionObserver!: IntersectionObserver;

  form = { name: '', email: '', phone: '', experience: 'No IT experience', role: '', batch: 'Weekday evenings', message: '' };
  formStatus = '';

  experienceOptions = ['No IT experience', 'Less than 1 year in IT', '1 to 3 years in IT', '3+ years in IT/DevOps/Cloud'];
  batchOptions = ['Weekday evenings', 'Weekends', 'Not sure yet'];

  why = [
    { title: 'Lab-first', desc: 'Every session is mostly hands-on, with break-and-fix challenges.' },
    { title: 'Job-focused sequence', desc: 'Prerequisites come first, and each phase has a readiness checkpoint.' },
    { title: 'Security built in', desc: 'IAM, secrets and scanning appear throughout, not only at the end.' },
    { title: 'Cost-aware', desc: 'Free-tier and low-cost labs with a destroy-after-lab habit.' }
  ];

  who = [
    { title: 'Beginners', desc: 'Start from zero with Linux, AWS and Git.' },
    { title: 'IT professionals', desc: 'Move from sysadmin, support or development into DevOps.' },
    { title: 'Cloud engineers', desc: 'Strengthen CI/CD, containers, IaC and observability.' },
    { title: 'Interview candidates', desc: 'Practise scenarios, troubleshooting and mock rounds.' }
  ];

  labPhases: { name: string; from: number; to: number; project: string; challenge: string; dailyLabs: { n: number; lab: string }[]; open: boolean }[] = [];

  flow = ['Developer', 'GitHub', 'CI/CD', 'SonarQube', 'Docker', 'Trivy',
    'Amazon ECR', 'Kubernetes / EKS', 'AWS Infrastructure', 'Prometheus + Grafana', 'Alerts / Monitoring'];

  tech = ['AWS', 'Linux', 'Git', 'GitHub', 'Jenkins', 'GitHub Actions', 'Docker',
    'Kubernetes', 'EKS', 'Terraform', 'Ansible', 'Python', 'Bash',
    'Prometheus', 'Grafana', 'OpenTelemetry', 'Loki', 'Trivy', 'DevSecOps'];

  interviewItems = [
    { title: 'AWS questions', desc: 'Daily questions with model answers.' },
    { title: 'Linux questions', desc: 'Daily questions with model answers.' },
    { title: 'Networking questions', desc: 'Daily questions with model answers.' },
    { title: 'Docker questions', desc: 'Daily questions with model answers.' },
    { title: 'Kubernetes questions', desc: 'Daily questions with model answers.' },
    { title: 'Terraform questions', desc: 'Daily questions with model answers.' },
    { title: 'CI/CD questions', desc: 'Daily questions with model answers.' },
    { title: 'DevSecOps questions', desc: 'Daily questions with model answers.' },
    { title: 'Scenario troubleshooting', desc: 'Daily questions with model answers.' },
    { title: 'Mock interviews', desc: 'Technical and scenario rounds with feedback.' },
    { title: 'Resume & project discussion', desc: 'Turn your labs and capstone into strong talking points.' }
  ];

  faqItems = [
    { q: 'Who can join?', a: 'Students, career changers, IT professionals and cloud engineers who want hands-on DevOps skills.', open: false },
    { q: 'Do I need AWS experience?', a: 'No. The program starts with AWS fundamentals.', open: false },
    { q: 'Is Linux knowledge required?', a: 'No. Linux is taught from the basics before it is needed.', open: false },
    { q: 'Is this suitable for beginners?', a: 'Yes. It progresses from beginner to advanced with checkpoints.', open: false },
    { q: 'How much practical work is included?', a: 'Roughly 75% of session time is hands-on labs.', open: false },
    { q: 'Will I receive assignments?', a: 'Yes, every day has an assignment, and each phase ends with an assessment.', open: false },
    { q: 'Is interview preparation included?', a: 'Yes: daily interview questions, mock interviews and resume review.', open: false },
    { q: 'What AWS costs will I need to pay?', a: 'Labs favor free-tier and low-cost resources and teach teardown habits. EKS labs cost a little more.', open: false },
    { q: 'Will there be a capstone project?', a: 'Yes, an end-to-end project from code to monitored production on AWS.', open: false },
    { q: 'What happens after the 90 days?', a: 'You leave with a portfolio, documentation and interview practice.', open: false }
  ];

  phases: PhaseEntry[] = [];

  private dayData = `Orientation|AWS account, MFA, budget alarm|Draw the DevOps lifecycle|What is DevOps?
AWS Global Infrastructure|Console tour, pick a region|Compare 3 regions|Region vs AZ
IAM Basics|Users, groups, MFA|Custom S3 read policy|IAM policy structure
IAM Roles|Assume a role via CLI|Fix a broken policy|User vs role
Linux Shell|Navigate and edit files|30-command sheet|Linux directory layout
Linux Permissions|chmod, users, processes|Permissions puzzle|What does chmod 755 mean?
EC2 Launch|Launch, SSH, install nginx|Break and fix SSH|Is a security group stateful?
EBS and AMI|Mount, snapshot, bake an AMI|Restore a snapshot|EBS vs instance store
IP Networking|CIDR and subnet drills|10 CIDR problems|What is a /24?
VPC Basics|Public subnet web server|Diagram your VPC|Public vs private subnet
NAT and Phase 1 Checkpoint|Bastion plus NAT, fix an unreachable host|Phase 1 test|NAT gateway vs IGW
Linux Services|systemd service and cron job|Schedule a backup|systemd basics
Linux Troubleshooting|grep/awk logs, top, df|Diagnose 3 broken servers|High CPU: your steps?
DNS and HTTPS|dig, curl -v, inspect certificates|Trace a request|What happens when you type a URL?
Route 53 and ACM|Domain to EC2 with TLS|Failover record|A vs CNAME vs alias
Load Balancers|ALB across 2 AZs|Fix a failing health check|ALB vs NLB
Auto Scaling|Scale on CPU load|Scheduled scaling|Scale in vs out
S3|Static site, lifecycle, block public access|Secure a leaky bucket|S3 storage classes
RDS|RDS in a private subnet|Snapshot and restore|Multi-AZ vs read replica
CloudWatch and AWS CLI|Alarm to SNS, CLI script|Cleanup script|Metrics vs logs
3-Tier Architecture Checkpoint|Deploy, then kill an instance|Phase 2 test|Design a highly available app
Git Basics|Local repo workflow|Fix commit mistakes|Git vs GitHub
Branching and Merging|Resolve conflicts, rebase|Rebase exercise|Merge vs rebase
GitHub Workflow|Pull request with reviews|Gitflow vs trunk-based write-up|Branching strategies
Bash I|System report script|3 utility scripts|Exit codes
Bash II|Backup script to S3|Resource audit script|set -euo pipefail
Python Basics|Parse JSON and logs|Small CLI tool|List vs dict
Boto3|Stop untagged EC2 (dry run)|Tag compliance checker|boto3 client vs resource
Ansible I|Configure nginx on 2 EC2s|Add handlers|Idempotency
Ansible II|Roles and Vault|Dynamic AWS inventory|Role structure
Phase 3 Checkpoint|Repo, script and playbook mini project|Phase 3 test|Scripting scenarios
CI/CD Concepts|Build a sample app|Draw a pipeline|CI vs CD
Jenkins I|Freestyle job from GitHub|Trigger on push|Jenkins architecture
Jenkins Pipelines|Multi-stage Jenkinsfile|Add parallel stages|Declarative vs scripted
Jenkins Advanced|Docker agent, credentials|Debug a failing pipeline|Secrets in Jenkins
GitHub Actions I|Build and test workflow|Add a matrix|Jobs vs steps
GitHub Actions and AWS OIDC|Deploy with no stored keys|Add an approval gate|Why OIDC?
Azure DevOps Concepts|Run a YAML pipeline|Compare with Jenkins|Tool comparison
SonarQube and Artifacts|Failing quality gate|Fix code smells|What is a quality gate?
Deployment Strategies|Blue-green via ALB|Write a rollback plan|Canary vs blue-green
CI/CD Security Checkpoint|Secret scan in a pipeline|Phase 4 test|How do you secure a pipeline?
Docker Basics|Run 5 images|Explore containers|Container vs VM
Images and Containers|Inspect layers|Debug a crashing container|Image vs container
Dockerfile|Containerize an app|Speed up the build|COPY vs ADD
Multi-stage Builds|Cut image size by 80%|Compare sizes|Why multi-stage?
Docker Networking|Two containers talking|Fix connectivity|Bridge vs host
Docker Volumes|Persist a database|Back up a volume|Volume vs bind mount
Docker Compose|App, DB and cache stack|Add healthchecks|Why Compose?
Amazon ECR|Push to ECR, pull on EC2|Lifecycle policy|Tagging strategy
Trivy and Container Security|Scan and fix CVEs|Gate a pipeline on Trivy|Image hardening steps
Docker Checkpoint|5 broken containers|Phase 5 test|Container exits with 137?
Kubernetes Architecture|Local kind cluster|Draw the architecture|What happens on kubectl apply?
kubectl and Pods|Run and debug pods|10 kubectl tasks|Pod vs container
Deployments|Update and roll back|Break a rollout|Rolling update mechanics
Services|Expose an app|Debug no endpoints|Service types
ConfigMaps and Secrets|Externalize config|Rotate a secret|Are Secrets secure?
Namespaces and Quotas|Multi-team namespaces|Quota exercise|Labels vs annotations
Resources and Probes|Trigger OOM and probe failures|Tune a probe|Requests vs limits
Jobs and CronJobs|Scheduled backup job|Handle job failure|Job vs CronJob
Ingress|Two apps behind one ingress, TLS|Add TLS|Ingress vs LoadBalancer
Storage|PV, PVC, StorageClass|Resize a PVC|PV vs PVC
Helm|Write and install a chart|Chart for the capstone|Why Helm?
Kubernetes Troubleshooting|8 broken manifests|Timed drill|CrashLoopBackOff steps
EKS I|Create a small EKS cluster, delete same day|Cost notes|EKS vs self-managed
EKS II|App behind ALB with HPA|Load test|How does HPA work?
Kubernetes Checkpoint|Practical exam|Phase 6 test|Scenario questions
Terraform Basics|S3 bucket with Terraform|Destroy cleanly|Declarative vs imperative
Variables and Outputs|Parameterized EC2|tfvars per environment|Variable precedence
Data Sources and Loops|Dynamic AMI lookup|Multiple subnets|count vs for_each
Terraform State|Move state to S3|Fix a drifted resource|What is state?
Modules|Build a VPC module|Publish to Git|Module design
AWS Infrastructure with Terraform|Rebuild the Day 20 stack|Document it|Dependency handling
Environments|Dev/prod split|Compare approaches|Workspaces vs directories
EKS and RDS with Terraform|Provision EKS from code|Cost estimate|Importing resources
Terraform CI/CD|Plan on PR, scan with checkov|Add policy checks|Terraform in CI
Terraform Checkpoint|Fix broken Terraform|Phase 7 test|State troubleshooting
Observability and SRE Basics|Instrument a sample app|Pick golden signals|Monitoring vs observability
Prometheus|Install, write 10 queries|Query set|Pull vs push
Grafana and Node Exporter|Host dashboard|Dashboard as code|RED vs USE
Kubernetes Monitoring|kube-prometheus-stack|Add a custom metric|What is cardinality?
Logging|Ship logs to CloudWatch or Loki|Log-based alert|Structured logging
OpenTelemetry and Alerting|Fire and resolve alerts|Write a runbook|Alert fatigue
SLOs and Phase 8 Checkpoint|Define SLOs, write a postmortem|Phase 8 test|SLI vs SLO vs SLA
IAM, Secrets and KMS|Encrypt S3 and RDS|Remove hardcoded keys|KMS key types
CloudTrail, Config, GuardDuty|Enable and review findings|Fix 3 findings|CloudTrail vs Config
Kubernetes Security|RBAC and NetworkPolicy|Least-privilege role|RBAC components
DevSecOps Pipeline|Add Trivy, SAST and IaC scan|Fix the findings|What is shift-left?
Security Automation Checkpoint|Auto-close an open SG with Lambda|Phase 9 test|Incident response steps
Capstone Build|Integrate and deploy|Complete the README|Walk through your architecture
Capstone Troubleshooting|Break and fix your platform|Docs and cost report|Troubleshooting stories
Demo and Mock Interview|15-minute demo, mock interview|Polish resume and GitHub|Full interview round`;

  private phasesMeta: [string, number, number, string][] = [
    ['Cloud, Linux & Networking Foundations', 0, 10, 'DevOps lifecycle, IAM, Linux, IP networking, EC2, VPC. Checkpoint: private-subnet VPC with bastion access.'],
    ['AWS Infrastructure', 11, 20, 'DNS, load balancing, Auto Scaling, S3, RDS, CloudWatch. Checkpoint: a 3-tier app that survives instance failure.'],
    ['Git, Scripting & Automation', 21, 30, 'Git, GitHub, Bash, Python/Boto3, Ansible. Checkpoint: fully automated server setup.'],
    ['Git & CI/CD', 31, 40, 'Jenkins, GitHub Actions, SonarQube, deployment strategies, pipeline security.'],
    ['Docker & Containers', 41, 50, 'Images, Dockerfiles, networking, volumes, Compose, ECR, Trivy.'],
    ['Kubernetes & EKS', 51, 65, 'Core objects, probes, ingress, storage, Helm, troubleshooting, EKS.'],
    ['Terraform & Infrastructure as Code', 66, 75, 'Resources, state, modules, environments, Terraform with AWS and CI.'],
    ['Monitoring & Observability', 76, 82, 'Prometheus, Grafana, logging, OpenTelemetry, alerting, SLOs.'],
    ['DevSecOps & Cloud Security', 83, 87, 'KMS, secrets, CloudTrail, Config, GuardDuty, Kubernetes security, automation.'],
    ['Capstone Project & Interview Preparation', 88, 90, 'Integration, troubleshooting, documentation, demo and mock interview.']
  ];

  private labExtras: [string, string][] = [
    ['Secure two-tier VPC with bastion access', 'An instance is unreachable: find the missing route or security-group rule'],
    ['Highly available 3-tier web app', 'ALB returns 502: trace and fix target health'],
    ['Automated server setup with Bash and Ansible', 'A playbook fails on half the hosts'],
    ['CI/CD pipeline from commit to deployment', 'Pipeline passes locally but fails in CI'],
    ['Containerized multi-service app pushed to ECR', 'A container keeps restarting (exit code 137)'],
    ['Microservice app on EKS with ingress and autoscaling', 'Pods stuck Pending and a service with no endpoints'],
    ['Whole AWS stack as reusable Terraform modules', 'Drifted state and a failed apply'],
    ['Monitoring stack with dashboards and alerts', 'Alert storm: redesign as SLO-based alerts'],
    ['Security baseline with auto-remediation', 'Find and fix an over-privileged role and an open bucket'],
    ['Capstone platform demo', 'Live failure injection during a game day']
  ];

  constructor() {
    const allDays: DayEntry[] = this.dayData.split('\n').map((l, i) => {
      const [t, lab, hw, q, tp] = l.split('|');
      return { n: i, t, lab, hw, q, tp, hidden: false };
    });
    this.phases = this.phasesMeta.map(([name, from, to, goal], i) => ({
      name, from, to, goal,
      days: allDays.slice(from, to + 1),
      open: i === 0, hidden: false
    }));
    this.labPhases = this.phasesMeta.map(([name, from, to], i) => ({
      name, from, to,
      project: this.labExtras[i][0],
      challenge: this.labExtras[i][1],
      dailyLabs: allDays.slice(from, to + 1).map(d => ({ n: d.n, lab: d.lab })),
      open: i === 0
    }));
  }

  ngAfterViewInit(): void {
    const ids = ['home', 'program', 'curriculum', 'labs', 'capstone', 'tech', 'interview', 'contact', 'faq'];
    this.sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) this.activeSection = e.target.id;
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) this.sectionObserver.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showBackToTop = window.scrollY > 400;
  }

  toggleNav(): void { this.navOpen = !this.navOpen; }
  closeNav(): void { this.navOpen = false; }

  onSearch(): void {
    const v = this.searchQuery.toLowerCase().trim();
    this.phases.forEach(ph => {
      let any = false;
      ph.days.forEach(d => {
        const text = `${d.t} ${d.lab} ${d.hw} ${d.q} ${d.tp || ''}`.toLowerCase();
        d.hidden = !!v && !text.includes(v);
        if (!d.hidden) any = true;
      });
      ph.hidden = !!v && !any;
      if (v && any) ph.open = true;
    });
  }

  onSubmit(isValid: boolean | null): void {
    if (!isValid) {
      this.formStatus = 'Please enter your name and a valid email address.';
      return;
    }
    const f = this.form;
    const body = `Name: ${f.name}\nEmail: ${f.email}\nPhone: ${f.phone}\nExperience: ${f.experience}\nRole: ${f.role}\nBatch: ${f.batch}\n\n${f.message}`;
    const subject = 'Enrollment request from ' + f.name;
    this.formStatus = 'Opening your email app to send this enrollment request...';
    window.location.href = `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
