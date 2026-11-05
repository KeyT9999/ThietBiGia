export type PartnerProposalStatus = "pending" | "approved" | "rejected";

export type PartnerOrganizationProposal = {
  id: string;
  member_id: string;
  member_name: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  status: PartnerProposalStatus;
  review_note: string;
  approved_organization_id: string | null;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
};
