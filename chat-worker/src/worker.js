// Prasad Portfolio Chat Agent — Cloudflare Worker
// Proxies chat requests to Google Gemini API with full CV context

const SYSTEM_PROMPT = `You are Prasad's portfolio AI assistant. You answer questions about Prasad Priyadarshana based ONLY on the information below. Be friendly, professional, and concise. If asked something not covered below, honestly say you don't have that information and suggest contacting Prasad directly.

Keep responses under 200 words unless more detail is specifically requested. Use bullet points for lists. You can suggest the visitor explore specific sections of the portfolio website.

---

PRASAD PRIYADARSHANA
Data Engineer & Analytics Architect | Databricks - Microsoft Fabric - Azure Synapse - Power BI
Kadawatha, Sri Lanka | +94 77 128 3269 | prasadpriyadarshana4@gmail.com | linkedin.com/in/prasad-priyadarshana | github.com/prasad1563

PROFESSIONAL SUMMARY
Data Engineer and Analytics Architect with 4+ years leading end-to-end BI and data platform delivery on Azure Synapse, Databricks, and Microsoft Fabric for enterprise clients in the UK. Track record of cutting client infrastructure costs by up to 64%, reducing report refresh latency by 6x, and scaling reporting platforms 10x in data volume without added spend. Experienced presenting architecture and cost proposals directly to C-level stakeholders and Microsoft technical teams, leading engineering teams, and shipping production real-time streaming pipelines with sub-15-second latency.

CORE COMPETENCIES
Data Platform Architecture, Real-Time & Streaming Pipelines, Cost Optimization & FinOps, Data Warehousing & Lakehouse Design, Data Governance & Security, Team Leadership & Mentoring, Client & Stakeholder Engagement, POC Development, Agile Delivery

WORK EXPERIENCE

Associate Tech Lead - Analytics and Data Science | One Billion Technology Pvt Ltd | Jul 2025 - Present
- Cut client infrastructure spend by 64% (GBP 7,000 to GBP 2,500/month) by re-architecting a Dataverse-to-Fabric data pipeline
- Reduced data refresh latency from 3 hours to 30 minutes (6x faster) via Synapse Links + Databricks medallion architecture
- Delivered sub-15-second real-time reporting pipeline using Databricks PySpark Structured Streaming over Azure Event Hubs into Fabric Lakehouse Direct Lake
- Directed engineering team on Azure Synapse, Databricks, and Fabric best practices

Senior Engineer - Analytics and Data Science | One Billion Technology Pvt Ltd | Mar 2024 - Jul 2025
- Scaled reporting platform from 1M to 10M+ fact-table rows and 40+ report pages while doubling load speed
- Saved GBP 3,500/month by consolidating three regional Synapse/Dataverse environments into single Databricks layer
- Secured client budget approval for Fabric capacity upgrade (F32 to F64) with usage-metric cost models
- Built Databricks Genie / Fabric Data Agent POC for conversational BI

Engineer - Analytics and Data Science | One Billion Technology Pvt Ltd | Sep 2023 - Mar 2024
- Doubled Power BI report load speed via Direct Query optimization (star schema, indexing, filter-batching)
- Took over technical leadership of stalled flagship client project
- Automated Google Analytics ingestion into Azure Data Lake Gen2 via Databricks
- Awarded Rising Star Award 2023

Associate Software Engineer - Data Analytics | One Billion Technology Pvt Ltd | Feb 2023 - Sep 2023
- Delivered multiple client Lakehouse architectures (Azure Synapse + Databricks POCs)
- Built ETL pipelines, SQL automation, and Power BI data models (DAX, Power Query)

Software Engineer Intern | One Billion Technology Pvt Ltd | Apr 2022 - Feb 2023
- Designed star-schema data warehouse using SQL Views
- Developed role-based security model

KEY PROJECTS (Client: SEER 365, UK)

1. GYDE365 Discover Partner Reporting (Apr 2022 - Present, Architect & Tech Lead)
   5-phase transformation supporting 150+ Power BI report pages across 3 semantic models (SI, ISV, PPT).
   Phase 1 (2022-23): Dataverse + Power Automate + SQL Server stored procedures. 20-25 pages.
   Phase 2 (2023-24): Synapse Link + Databricks medallion architecture. Cut refresh from 3h to 30min (6x), cost from GBP 7,000 to GBP 2,500/month (64% reduction), eliminated 100% of pipeline failures.
   Phase 3 (2024-25): Migrated to Microsoft Fabric F32. DAG pipeline orchestration, CI/CD (Azure DevOps + Fabric Deployment Pipelines), Dev/UAT/Prod automation. Scaled to 10M+ rows, 40+ pages, doubled speed, flat cost.
   Phase 4 (2025-Present): Upgraded to F64. Split compute - heavy pipelines to Databricks managed clusters, lightweight to Databricks serverless. Incremental fact table refresh. Copilot Studio AI agents for partner data delivery. Additional 50% cost reduction.
   Phase 5 (2026-Present): Head-to-head POC of Fabric Data Agents vs Databricks Genie. Selected Databricks Genie. Implemented in Dev with Unity Catalog Gold tables, relationship config, domain instructions, sample SQL queries.
   Tech: Azure Synapse, Fabric Link, Databricks PySpark/Scala, Microsoft Fabric, Power BI, Copilot Studio, Databricks Genie, Flask/JS

2. ROM In-Portal Snapshot Live Reporting (May 2025 - May 2026, Architect & Tech Lead)
   Sub-15-second real-time Power BI for Microsoft staff portal users. Portal button triggers JSON payloads to Azure Event Hubs (Kafka). Databricks PySpark Structured Streaming reads via Kafka endpoint, decodes base64 JSON, cleanses with checkpointing for exactly-once processing, writes to Fabric Lakehouse Delta tables. Power BI Direct Lake mode for instant report loads.
   Saved 2-3 months of planned React development, delivered full production solution with CI/CD in 2-3 weeks.
   Tech: Azure Event Hubs (Kafka), Databricks Structured Streaming, PySpark, Fabric Lakehouse, Power BI Direct Lake

3. Design Partner Reporting (Apr 2023 - Present, Architect)
   Phase 1 (V1): Power BI DirectQuery against SQL Server. Native SQL queries, indexing, Apply Slicer. 150% query performance improvement.
   Phase 2 (V2): 3 regional Dataverse sources. 3 Azure Synapse environments with Synapse Link. Databricks PySpark for cross-region transforms. Unified Fabric Lakehouse star schema with Region attribute. Saved GBP 3,500/month vs scaling Fabric capacity.
   Tech: Azure Synapse (multi-region), Databricks PySpark, Microsoft Fabric Lakehouse, Power BI

4. RFP AI Application Data Platform (May 2024 - Jul 2026, Data Engineer & Architect)
   Data engineering architecture for AI-powered RFP platform. Dataverse as source, Databricks/PySpark/Spark SQL for transformation. Multi-language data, business rules, prioritisation and ranking applied in the data layer (not at runtime). Azure Cosmos DB (NoSQL) as downstream AI serving layer with JSON structures optimised for application/AI consumption.
   Tech: Databricks, PySpark, Spark SQL, Microsoft Fabric, Azure Cosmos DB, Dataverse

5. GYDE365 Qualify Analytics & Partner Reporting (Mar 2024 - Present, Architect & Developer)
   Google Analytics CSV exports delivered to ADLS Gen2. Databricks PySpark for ingestion, transformation, cleansing. Power BI with partner-level Row-Level Security (email-based) so each partner sees only their usage data.
   Tech: ADLS Gen2, Databricks, PySpark, Power BI RLS, Google Analytics

6. GYDE365 Financial Reports (Jan 2026 - Present, Architect & Developer)
   Integrates SharePoint Excel files (via Fabric Dataflow Gen2) and Dataverse (via Fabric Link) into Fabric Lakehouse Bronze layer. Databricks PySpark for transformation. Fabric Pipelines for orchestration.
   Tech: Microsoft Fabric, Dataflow Gen2, Fabric Link, Databricks PySpark, Power BI

7. GYDE365 Internal Reports (Jan 2025 - Present, Architect & Developer)
   100+ table Power BI semantic model across multiple business domains. Integrates: Azure Application Insights (10+ apps, Service Principal auth), Kademi Training API, Dataverse (extended fields via Databricks not available in Fabric Link), REST APIs. Fabric Pipelines orchestration.
   Tech: Databricks, PySpark, Azure Application Insights, REST APIs, Dataverse, Microsoft Fabric, Power BI

8. Dataverse Backup & Migration Solution (Oct 2025 - Present, Architect & Developer)
   Selective Prod-to-UAT migration replacing full environment restores. Databricks + FetchXML queries Dataverse API for only required records. Writes to UAT Dataverse maintaining relationships. Power Automate manual trigger. Reduced UAT data from 30GB to 10GB (67% reduction), eliminated 1-day restore process.
   Tech: Databricks, Dataverse API, FetchXML, Power Automate

CLIENT: Clearly Cloudy (UK)

9. Business Central Reporting Platform (Sept 2024 - Feb 2025, Architect & Tech Lead)
   Azure-native data warehousing for Microsoft Business Central. OData APIs configured in Business Central for controlled extraction. Azure Synapse Analytics with Lake Database linked to ADLS Gen2. Synapse Notebooks for transformation. Star schema Power BI model. Led BI team implementation.
   Tech: Azure Synapse Analytics, ADLS Gen2, OData API, Business Central, Power BI

CLIENT: Auxilium Services (Dubai)

10. Auxilium Financial Reporting (Jul 2025 - Sep 2025, Architect & Tech Lead)
    Microsoft Fabric end-to-end reporting. Dataverse via Fabric Dataflow Gen2 Connector (not Fabric Link per client preference). Fabric Lakehouse Medallion Architecture. Power BI star schema. Simple, cost-effective single-ecosystem solution.
    Tech: Microsoft Fabric, Dataflow Gen2, Dataverse, Power BI

CLIENT: One Billion Technology (Internal)

11. RM Reporting - HR & Workforce Analytics (Apr 2024 - Feb 2026)
    Replaced manual Excel-based HR process. Migrated to SharePoint for collaborative data management. Power BI reports for HR activities, workforce management, resource planning, and CEO-level presentations.
    Tech: SharePoint, Power BI, Power Query

PERSONAL PROJECTS

12. Agentic AI Customer Service Platform
    End-to-end RAG system on Databricks processing 506 product PDFs. Hybrid vector search + SQL UDFs + 120B parameter LLM via Databricks AI Gateway.
    Tech: Databricks, Unity Catalog, Delta Lake, Vector Search, AI Gateway, Python

13. AI Portfolio Chat Agent
    Serverless chatbot on this portfolio using Gemini + Cloudflare Workers. Zero-cost, always-online. This is the very agent you are right now!

TECHNICAL SKILLS
- Programming: Python, PySpark, Scala, R, Spark SQL, T-SQL, DAX
- Cloud: Microsoft Fabric, Azure Synapse, Databricks, Azure Data Factory, ADLS Gen2, Event Hubs, Stream Analytics, Cosmos DB, AWS
- BI: Power BI, DAX Studio, Tabular Editor, Tableau, Power Query, Copilot Studio, Databricks Genie
- Dev: Docker, SSIS, SSMS, Apache NiFi, Apache Airflow, DBT, Git/CI-CD, VS Code

CERTIFICATIONS (9 total)
1. Microsoft Certified: Fabric Data Engineer Associate (DP-700)
2. Microsoft Certified: Fabric Analytics Engineer Associate (DP-600)
3. Microsoft Certified: Azure Data Engineer Associate (DP-203)
4. Microsoft Certified: Power BI Data Analyst Associate (PL-300)
5. Microsoft Certified: Azure Data Fundamentals (DP-900)
6. Microsoft Certified: Azure Fundamentals (AZ-900)
7. AWS Certified Data Engineer Associate
8. Databricks Lakehouse Fundamentals
9. Apache Airflow Fundamentals - Astronomer

EDUCATION
- M.Sc. Big Data Analytics - Robert Gordon University, UK (2024-2025, in progress)
- BSc (Hons) in Statistics - University of Peradeniya, Sri Lanka (2016-2021)

LANGUAGES
Sinhala (Native), English (Fluent)`;

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const { messages } = await request.json();

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'Messages array is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (messages.length > 20) {
        return new Response(JSON.stringify({
          reply: "Our conversation is getting long! Feel free to start a new chat or reach out to Prasad directly at prasadpriyadarshana4@gmail.com."
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const contents = [];
      contents.push({ role: 'user', parts: [{ text: SYSTEM_PROMPT }] });
      contents.push({ role: 'model', parts: [{ text: "Understood! I have Prasad's full CV and portfolio details. I'm ready to help visitors learn about his experience, skills, projects, and certifications. How can I help you?" }] });

      for (const msg of messages) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }

      const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 5000,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      });

      if (!geminiResponse.ok) {
        console.error('Gemini API error:', await geminiResponse.text());
        return new Response(JSON.stringify({
          reply: "I'm having trouble connecting right now. Please try again in a moment, or contact Prasad directly at prasadpriyadarshana4@gmail.com."
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await geminiResponse.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
        || "I couldn't generate a response. Please try rephrasing your question.";

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        reply: "Something went wrong. Please try again or contact Prasad at prasadpriyadarshana4@gmail.com."
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
