import { NavLink } from 'react-router-dom';
import './NavBar.css';

import calendarIcon from '../NavBarAssets/calendar.png';
import calendarActiveIcon from '../NavBarAssets/calendar-active.png';

import todoIcon from '../NavBarAssets/todo.png';
import todoActiveIcon from '../NavBarAssets/todo-active.png';

import journalIcon from '../NavBarAssets/journal.png';
import journalActiveIcon from '../NavBarAssets/journal-active.png';

import breathingIcon from '../NavBarAssets/breathing.png';
import breathingActiveIcon from '../NavBarAssets/breathing-active.png';

import selfcareIcon from '../NavBarAssets/selfcare.png';
import selfcareActiveIcon from '../NavBarAssets/selfcare-active.png';

const navItems = [
{
label: 'Calendar',
path: '/calendar',
icon: calendarIcon,
activeIcon: calendarActiveIcon,
},
{
label: 'To-do',
path: '/todo',
icon: todoIcon,
activeIcon: todoActiveIcon,
},
{
label: 'Journal',
path: '/journal',
icon: journalIcon,
activeIcon: journalActiveIcon,
},
{
label: 'Breathing Exercises',
path: '/breathingexercises',
icon: breathingIcon,
activeIcon: breathingActiveIcon,
},
{
label: 'Self-care',
path: '/selfcare',
icon: selfcareIcon,
activeIcon: selfcareActiveIcon,
},
];

function NavBar() {
return ( <nav className="navigation" aria-label="Main navigation"> <ul>
{navItems.map((item) => ( <li key={item.path}>
<NavLink
to={item.path}
aria-label={item.label}
className={({ isActive }) =>
isActive ? 'navLink active' : 'navLink'
}
> <span className="navIconWrapper"> <img
               src={item.icon}
               alt=""
               className="navIcon navIconDefault"
             /> <img
               src={item.activeIcon}
               alt=""
               className="navIcon navIconActive"
             /> </span> </NavLink> </li>
))} </ul> </nav>
);
}

export default NavBar;
