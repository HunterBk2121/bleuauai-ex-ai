-- LexCognito Features Database Schema
-- Strategic Dossier, Contract Drafting, Discovery Engine, Credit Billing

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Case Intakes Table
CREATE TABLE IF NOT EXISTS case_intakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matter_id TEXT NOT NULL,
    title TEXT NOT NULL,
    fact_pattern TEXT NOT NULL,
    parties TEXT[] DEFAULT '{}',
    jurisdiction TEXT NOT NULL,
    practice_area TEXT NOT NULL,
    cause_of_action TEXT[] DEFAULT '{}',
    procedural_history TEXT,
    key_dates JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategic Dossiers Table
CREATE TABLE IF NOT EXISTS strategic_dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intake_id UUID REFERENCES case_intakes(id) ON DELETE CASCADE,
    matter_id TEXT NOT NULL,
    legal_elements JSONB DEFAULT '[]',
    adversarial_analysis JSONB DEFAULT '{}',
    judicial_analysis JSONB,
    outcome_modeling JSONB DEFAULT '{}',
    discovery_imperatives JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    confidence DECIMAL(3,2) DEFAULT 0.5,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract Drafts Table
CREATE TABLE IF NOT EXISTS contract_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    contract_type TEXT NOT NULL,
    industry TEXT NOT NULL,
    parties JSONB NOT NULL,
    jurisdiction TEXT NOT NULL,
    clauses JSONB DEFAULT '[]',
    risk_assessment JSONB DEFAULT '{}',
    suggestions JSONB DEFAULT '[]',
    version INTEGER DEFAULT 1,
    matter_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clause Library Table
CREATE TABLE IF NOT EXISTS clause_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clause_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    industry TEXT[] DEFAULT '{}',
    contract_types TEXT[] DEFAULT '{}',
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
    favorability TEXT CHECK (favorability IN ('favorable', 'neutral', 'unfavorable')) DEFAULT 'neutral',
    negotiation_success DECIMAL(3,2) DEFAULT 0.5,
    usage_count INTEGER DEFAULT 0,
    created_by TEXT,
    tags TEXT[] DEFAULT '{}',
    alternatives TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discovery Initiatives Table
CREATE TABLE IF NOT EXISTS discovery_initiatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matter_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('planning', 'collection', 'processing', 'review', 'production', 'completed')) DEFAULT 'planning',
    custodians JSONB DEFAULT '[]',
    date_range JSONB NOT NULL,
    search_terms TEXT[] DEFAULT '{}',
    file_types TEXT[] DEFAULT '{}',
    data_sources TEXT[] DEFAULT '{}',
    documents_collected INTEGER DEFAULT 0,
    documents_processed INTEGER DEFAULT 0,
    documents_reviewed INTEGER DEFAULT 0,
    documents_produced INTEGER DEFAULT 0,
    review_categories JSONB DEFAULT '{}',
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discovery Documents Table
CREATE TABLE IF NOT EXISTS discovery_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID REFERENCES discovery_initiatives(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    custodian TEXT,
    date_created TIMESTAMP WITH TIME ZONE,
    date_modified TIMESTAMP WITH TIME ZONE,
    author TEXT,
    recipients TEXT[] DEFAULT '{}',
    extracted_text TEXT,
    ocr_confidence DECIMAL(3,2),
    language TEXT DEFAULT 'en',
    relevance_score DECIMAL(3,2) DEFAULT 0.5,
    privilege_score DECIMAL(3,2) DEFAULT 0.1,
    confidentiality_score DECIMAL(3,2) DEFAULT 0.3,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')) DEFAULT 'neutral',
    key_topics TEXT[] DEFAULT '{}',
    named_entities JSONB DEFAULT '[]',
    review_status TEXT CHECK (review_status IN ('pending', 'reviewed', 'privileged', 'produced', 'withheld')) DEFAULT 'pending',
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    bates_number TEXT,
    production_set TEXT,
    redacted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposition Analyses Table
CREATE TABLE IF NOT EXISTS deposition_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matter_id TEXT NOT NULL,
    deponent_name TEXT NOT NULL,
    deposition_date DATE NOT NULL,
    transcript TEXT NOT NULL,
    key_quotes JSONB DEFAULT '[]',
    inconsistencies JSONB DEFAULT '[]',
    follow_up_questions JSONB DEFAULT '[]',
    summary TEXT,
    credibility_assessment DECIMAL(3,2) DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Credits Table
CREATE TABLE IF NOT EXISTS user_credits (
    user_id TEXT PRIMARY KEY,
    total_credits INTEGER NOT NULL DEFAULT 0,
    used_credits INTEGER NOT NULL DEFAULT 0,
    remaining_credits INTEGER NOT NULL DEFAULT 0,
    subscription_tier TEXT CHECK (subscription_tier IN ('free', 'professional', 'enterprise')) DEFAULT 'free',
    monthly_allocation INTEGER NOT NULL DEFAULT 500,
    reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    credits INTEGER NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_intakes_matter_id ON case_intakes(matter_id);
CREATE INDEX IF NOT EXISTS idx_strategic_dossiers_matter_id ON strategic_dossiers(matter_id);
CREATE INDEX IF NOT EXISTS idx_strategic_dossiers_intake_id ON strategic_dossiers(intake_id);
CREATE INDEX IF NOT EXISTS idx_contract_drafts_matter_id ON contract_drafts(matter_id);
CREATE INDEX IF NOT EXISTS idx_contract_drafts_contract_type ON contract_drafts(contract_type);
CREATE INDEX IF NOT EXISTS idx_clause_library_contract_types ON clause_library USING GIN(contract_types);
CREATE INDEX IF NOT EXISTS idx_clause_library_industry ON clause_library USING GIN(industry);
CREATE INDEX IF NOT EXISTS idx_discovery_initiatives_matter_id ON discovery_initiatives(matter_id);
CREATE INDEX IF NOT EXISTS idx_discovery_documents_initiative_id ON discovery_documents(initiative_id);
CREATE INDEX IF NOT EXISTS idx_discovery_documents_review_status ON discovery_documents(review_status);
CREATE INDEX IF NOT EXISTS idx_deposition_analyses_matter_id ON deposition_analyses(matter_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_case_intakes_updated_at BEFORE UPDATE ON case_intakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_drafts_updated_at BEFORE UPDATE ON contract_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clause_library_updated_at BEFORE UPDATE ON clause_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discovery_initiatives_updated_at BEFORE UPDATE ON discovery_initiatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discovery_documents_updated_at BEFORE UPDATE ON discovery_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample clause library data
INSERT INTO clause_library (clause_type, title, content, industry, contract_types, risk_level, favorability, negotiation_success, tags, metadata) VALUES
('Limitation of Liability', 'Standard Limitation of Liability', 'IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM THE USE OF OR INABILITY TO USE THE SERVICES.', 
 ARRAY['Software', 'Technology'], ARRAY['Service Agreement', 'Software License'], 'medium', 'favorable', 0.75, 
 ARRAY['liability', 'damages', 'limitation'], '{"jurisdiction": ["Delaware", "California"], "dealSize": ["small", "medium"], "marketStandard": true}'),

('Indemnification', 'Mutual Indemnification Clause', 'Each party agrees to indemnify, defend, and hold harmless the other party from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys'' fees) arising out of or resulting from any breach of this Agreement by the indemnifying party.', 
 ARRAY['Software', 'Professional Services'], ARRAY['Service Agreement', 'Consulting Agreement'], 'high', 'neutral', 0.60, 
 ARRAY['indemnification', 'liability', 'defense'], '{"jurisdiction": ["New York", "Texas"], "dealSize": ["medium", "large"], "marketStandard": true}'),

('Confidentiality', 'Standard NDA Clause', 'Each party acknowledges that it may have access to certain confidential information of the other party. Each party agrees to maintain in confidence all confidential information received from the other party and not to disclose such information to third parties without prior written consent.', 
 ARRAY['All Industries'], ARRAY['NDA', 'Service Agreement', 'Employment Agreement'], 'low', 'favorable', 0.90, 
 ARRAY['confidentiality', 'nda', 'information'], '{"jurisdiction": ["All"], "dealSize": ["all"], "marketStandard": true}'),

('Termination', 'Termination for Convenience', 'Either party may terminate this Agreement at any time, with or without cause, by providing thirty (30) days written notice to the other party. Upon termination, all rights and obligations shall cease except for those that by their nature should survive termination.', 
 ARRAY['Professional Services', 'Consulting'], ARRAY['Service Agreement', 'Consulting Agreement'], 'medium', 'neutral', 0.65, 
 ARRAY['termination', 'notice', 'convenience'], '{"jurisdiction": ["California", "New York"], "dealSize": ["small", "medium"], "marketStandard": true}'),

('Payment Terms', 'Net 30 Payment Terms', 'Client shall pay all undisputed invoices within thirty (30) days of receipt. Late payments shall accrue interest at the rate of 1.5% per month or the maximum rate permitted by law, whichever is less. Client shall reimburse Provider for all costs of collection, including reasonable attorneys'' fees.', 
 ARRAY['Professional Services', 'Software'], ARRAY['Service Agreement', 'Software License'], 'low', 'favorable', 0.80, 
 ARRAY['payment', 'invoicing', 'interest'], '{"jurisdiction": ["All"], "dealSize": ["all"], "marketStandard": true}');

-- Insert sample credit rates (these match the rates in the service)
COMMENT ON TABLE user_credits IS 'Tracks user credit balances and subscription information';
COMMENT ON TABLE credit_transactions IS 'Logs all credit consumption transactions for transparency';
COMMENT ON TABLE case_intakes IS 'Stores case intake information for strategic dossier generation';
COMMENT ON TABLE strategic_dossiers IS 'Stores comprehensive strategic analysis results';
COMMENT ON TABLE contract_drafts IS 'Stores generated contract drafts and analysis';
COMMENT ON TABLE clause_library IS 'Library of reusable contract clauses with intelligence data';
COMMENT ON TABLE discovery_initiatives IS 'Manages discovery projects and workflows';
COMMENT ON TABLE discovery_documents IS 'Stores discovery documents with AI analysis results';
COMMENT ON TABLE deposition_analyses IS 'Stores deposition transcript analysis results';
