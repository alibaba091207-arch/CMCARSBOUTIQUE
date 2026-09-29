// Icone Phosphor (peso Light), importate come SVG testuali.
import arrowRight from '@phosphor-icons/core/assets/light/arrow-right-light.svg?raw';
import arrowLeft from '@phosphor-icons/core/assets/light/arrow-left-light.svg?raw';
import arrowUpRight from '@phosphor-icons/core/assets/light/arrow-up-right-light.svg?raw';
import caretLeft from '@phosphor-icons/core/assets/light/caret-left-light.svg?raw';
import caretRight from '@phosphor-icons/core/assets/light/caret-right-light.svg?raw';
import whatsapp from '@phosphor-icons/core/assets/light/whatsapp-logo-light.svg?raw';
import instagram from '@phosphor-icons/core/assets/light/instagram-logo-light.svg?raw';
import mapPin from '@phosphor-icons/core/assets/light/map-pin-light.svg?raw';
import clock from '@phosphor-icons/core/assets/light/clock-light.svg?raw';
import car from '@phosphor-icons/core/assets/light/car-light.svg?raw';
import arrowsLeftRight from '@phosphor-icons/core/assets/light/arrows-left-right-light.svg?raw';
import bank from '@phosphor-icons/core/assets/light/bank-light.svg?raw';
import magnifyingGlass from '@phosphor-icons/core/assets/light/magnifying-glass-light.svg?raw';

const raw = {
  arrowRight,
  arrowLeft,
  arrowUpRight,
  caretLeft,
  caretRight,
  whatsapp,
  instagram,
  mapPin,
  clock,
  car,
  arrowsLeftRight,
  bank,
  magnifyingGlass,
};

export function icon(name, cls = '') {
  return raw[name].replace('<svg ', `<svg class="icon ${cls}" aria-hidden="true" focusable="false" `);
}

export const serviceIcons = {
  vendita: 'car',
  permuta: 'arrowsLeftRight',
  finanziamento: 'bank',
  ricerca: 'magnifyingGlass',
};
