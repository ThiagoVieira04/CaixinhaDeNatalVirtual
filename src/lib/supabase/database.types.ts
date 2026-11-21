export type CampaignStatus = "draft" | "active" | "paused" | "closed";

export type ProfileRow = {
  id: string;
  full_name: string;
  business_name: string;
  created_at: string;
};

export type DonationStatus = "pending" | "confirmed" | "rejected";

export type CampaignRow = {
  id: string;
  merchant_id: string;
  slug: string;
  title: string;
  description: string;
  goal_cents: number;
  bank_code: string;
  bank_name: string;
  pix_key: string;
  pix_receiver_name: string;
  city: string;
  pix_url: string | null;
  pix_copy_paste: string | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
};

export type CampaignSummaryRow = CampaignRow & {
  total_cents: number;
  donation_count: number;
  pending_count: number;
};

export type PublicCampaignTotalRow = {
  id: string;
  slug: string;
  total_cents: number;
  donation_count: number;
};

export type PublicContributionRow = {
  slug: string;
  donor_name: string | null;
  amount_cents: number;
  note: string | null;
  confirmed_at: string;
};

export type DonationRow = {
  id: string;
  campaign_id: string;
  merchant_id: string;
  amount_cents: number;
  donor_name: string | null;
  note: string | null;
  status: DonationStatus;
  confirmed_at: string | null;
  donated_at: string;
  created_at: string;
};

type ProfileInsert = {
  id: string;
  full_name?: string;
  business_name?: string;
  created_at?: string;
};

type ProfileUpdate = {
  id?: string;
  full_name?: string;
  business_name?: string;
  created_at?: string;
};

type CampaignInsert = {
  id?: string;
  merchant_id: string;
  slug: string;
  title: string;
  description?: string;
  goal_cents?: number;
  bank_code?: string;
  bank_name?: string;
  pix_key?: string;
  pix_receiver_name?: string;
  city?: string;
  pix_url?: string | null;
  pix_copy_paste?: string | null;
  status?: CampaignStatus;
  created_at?: string;
  updated_at?: string;
};

type CampaignUpdate = {
  id?: string;
  merchant_id?: string;
  slug?: string;
  title?: string;
  description?: string;
  goal_cents?: number;
  bank_code?: string;
  bank_name?: string;
  pix_key?: string;
  pix_receiver_name?: string;
  city?: string;
  pix_url?: string | null;
  pix_copy_paste?: string | null;
  status?: CampaignStatus;
  created_at?: string;
  updated_at?: string;
};

type DonationInsert = {
  id?: string;
  campaign_id: string;
  merchant_id: string;
  amount_cents: number;
  donor_name?: string | null;
  note?: string | null;
  status?: DonationStatus;
  confirmed_at?: string | null;
  donated_at?: string;
  created_at?: string;
};

type DonationUpdate = {
  id?: string;
  campaign_id?: string;
  merchant_id?: string;
  amount_cents?: number;
  donor_name?: string | null;
  note?: string | null;
  status?: DonationStatus;
  confirmed_at?: string | null;
  donated_at?: string;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      campaigns: {
        Row: CampaignRow;
        Insert: CampaignInsert;
        Update: CampaignUpdate;
        Relationships: [];
      };
      donations: {
        Row: DonationRow;
        Insert: DonationInsert;
        Update: DonationUpdate;
        Relationships: [];
      };
    };
    Views: {
      campaign_summaries: {
        Row: CampaignSummaryRow;
        Relationships: [];
      };
      public_campaign_totals: {
        Row: PublicCampaignTotalRow;
        Relationships: [];
      };
      public_campaign_contributions: {
        Row: PublicContributionRow;
        Relationships: [];
      };
    };
    Functions: {
      register_contribution: {
        Args: {
          p_slug: string;
          p_amount_cents: number;
          p_donor_name: string;
          p_note: string;
        };
        Returns: string;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};
