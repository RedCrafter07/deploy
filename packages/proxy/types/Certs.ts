export interface Certificate {
	id: number;
	created_on: string;
	modified_on: string;
	owner_user_id: number;
	provider: string;
	nice_name: string;
	domain_names: string[];
	expires_on: string;
	meta: Meta;
}

export interface Meta {
	letsencrypt_email: string;
	dns_challenge: boolean;
	dns_provider: string;
	dns_provider_credentials: string;
	letsencrypt_agree: boolean;
}
