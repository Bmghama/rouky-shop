
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

export function getWhatsAppUrl(productName: string, price: number) {
  const message = `Bonjour Rouky Shop, je souhaite commander : ${productName} (${formatPrice(price)}).`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/22393932382?text=${encodedMessage}`;
}
