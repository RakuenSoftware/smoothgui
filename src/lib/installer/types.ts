export type InstallerRequestKind = 'text' | 'password' | 'checklist' | 'notice' | 'confirm';

export interface InstallerOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface InstallerRequestPayload {
  default?: string;
  multiple?: boolean;
  options?: InstallerOption[];
  placeholder?: string;
  minSelections?: number;
  maxSelections?: number;
}

export interface InstallerRequest {
  id: string;
  kind: InstallerRequestKind;
  title: string;
  message: string;
  payload?: InstallerRequestPayload;
}

export interface InstallerResponse {
  id: string;
  ok: boolean;
  value?: string;
  selected?: string[];
  error?: string;
}

export interface InstallerStatus {
  // Short banner (e.g. "Installing base system").
  title?: string;
  // Free-text detail line; supports \n.
  message?: string;
  // Step ordinal — when both current and total are present a progress bar is shown.
  current?: number;
  total?: number;
  // Direct percent override (0-100); takes priority over current/total.
  percent?: number;
  // Optional second-line annotation (e.g. "smoothfs DKMS build, ~2 min").
  detail?: string;
}
