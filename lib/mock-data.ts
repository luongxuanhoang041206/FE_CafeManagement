import type { User } from "@/lib/auth/types"

export interface Product {
  id: number
  name: string
  price: number
  active: boolean
  groupId: string
  createdAt: string
  description?: string
  imageUrl?: string
}

export const MOCK_USER: User = {
  id: "usr_1",
  name: "hoang ",
  email: "hoang@admin.com",
  role: "ADMIN",
}

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Analytics Dashboard Pro", price: 299.00, active: true, groupId: "GRP-A", createdAt: "2025-12-01", description: "Advanced analytics dashboard with real-time data streaming and customizable widgets." },
  { id: 2, name: "Cloud Storage Suite", price: 149.00, active: true, groupId: "GRP-A", createdAt: "2025-11-15", description: "Secure cloud storage with end-to-end encryption and team collaboration." },
  { id: 3, name: "API Gateway Standard", price: 99.00, active: false, groupId: "GRP-B", createdAt: "2025-10-20", description: "Reliable API gateway with rate limiting and request transformation." },
  { id: 4, name: "DevOps Pipeline Toolkit", price: 499.00, active: true, groupId: "GRP-B", createdAt: "2025-09-10", description: "Complete CI/CD pipeline management with automated testing and deployment." },
  { id: 5, name: "Security Audit Module", price: 199.00, active: true, groupId: "GRP-C", createdAt: "2025-08-05", description: "Comprehensive security scanning and vulnerability assessment tool." },
  { id: 6, name: "Data Migration Tool", price: 79.00, active: false, groupId: "GRP-C", createdAt: "2025-07-22", description: "Seamless data migration between databases with zero downtime." },
  { id: 7, name: "Team Collaboration Hub", price: 249.00, active: true, groupId: "GRP-A", createdAt: "2025-06-18", description: "Real-time collaboration platform with document sharing and video calls." },
  { id: 8, name: "Monitoring Dashboard", price: 179.00, active: true, groupId: "GRP-B", createdAt: "2025-05-30", description: "Infrastructure monitoring with alerting and custom dashboards." },
  { id: 9, name: "Email Service API", price: 59.00, active: true, groupId: "GRP-C", createdAt: "2025-04-12", description: "Transactional email API with template management and analytics." },
  { id: 10, name: "Load Balancer Pro", price: 349.00, active: false, groupId: "GRP-A", createdAt: "2025-03-08", description: "Intelligent load balancing with health checks and auto-scaling." },
  { id: 11, name: "Log Aggregation Engine", price: 129.00, active: true, groupId: "GRP-B", createdAt: "2025-02-14", description: "Centralized log management with search and visualization." },
  { id: 12, name: "Webhook Manager", price: 89.00, active: true, groupId: "GRP-C", createdAt: "2025-01-20", description: "Webhook delivery management with retry logic and event filtering." },
]

// Simulates an API call with latency
export async function fetchProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return [...MOCK_PRODUCTS]
}

export async function fetchProductById(id: number): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null
}
