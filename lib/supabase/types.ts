export type MessageStatus = "sent" | "delivered" | "read" | "confirmed" | "failed";

export type Database = {
  public: {
    Tables: {
      communities: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["communities"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["communities"]["Insert"]>;
      };
      owners: {
        Row: {
          id: string;
          community_id: string;
          name: string;
          unit: string;
          phone: string;
          email: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["owners"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["owners"]["Insert"]>;
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          community_id: string | null;
          community_name: string;
          title: string;
          message: string;
          has_pdf: boolean;
          sent_at: string;
          total_recipients: number;
        };
        Insert: Omit<Database["public"]["Tables"]["campaigns"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Insert"]>;
      };
      campaign_rows: {
        Row: {
          id: string;
          campaign_id: string;
          owner_id: string | null;
          owner_name: string;
          unit: string;
          phone: string;
          status: MessageStatus;
          read_at: string | null;
          confirmed_at: string | null;
          reply: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["campaign_rows"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["campaign_rows"]["Insert"]>;
      };
    };
  };
};
