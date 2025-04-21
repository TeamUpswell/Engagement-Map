export interface ResponseData {
    id: number;
    created_at: string;
    cares_for_girl: boolean;
    received_hpv_dose: boolean;
    ready_for_vaccine: string;
    whatsapp_joined?: string;
    latitude: number;
    longitude: number;
    address: string;
}