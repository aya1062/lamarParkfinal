import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

type FloatingContactProps = {
	showWhatsApp?: boolean;
	showPhone?: boolean;
	whatsappNumber?: string;
	phoneNumber?: string;
};

/**
 * Small floating action buttons that keep support contacts one click away.
 */
const FloatingContact: React.FC<FloatingContactProps> = ({
	showWhatsApp = true,
	showPhone = true,
	whatsappNumber = '+966558466380',
	phoneNumber = '+966558466380'
}) => {
	if (!showWhatsApp && !showPhone) {
		return null;
	}

	return (
		<div className="fixed bottom-6 left-6 flex flex-col gap-3 z-40">
			{showWhatsApp && (
				<a
					href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
					target="_blank"
					rel="noreferrer"
					className="flex items-center gap-2 rounded-full bg-green-500 text-white shadow-lg px-5 py-3 hover:bg-green-600 transition"
				>
					<MessageCircle className="h-5 w-5" />
					تواصل واتساب
				</a>
			)}

			{showPhone && (
				<a
					href={`tel:${phoneNumber}`}
					className="flex items-center gap-2 rounded-full bg-gold text-white shadow-lg px-5 py-3 hover:bg-[#C08C2B] transition"
				>
					<Phone className="h-5 w-5" />
					اتصال مباشر
				</a>
			)}
		</div>
	);
};

export default FloatingContact;
