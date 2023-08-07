import Image from "next/image";
import Link from "next/link";
// @ts-ignore
import styles from "./navbar.modules.css";
export default function Navbar(){
    return (
      <nav className={styles.nav}>
          <Link href= "/">
            <span  className={styles.logoContainer}>
                 <Image width = {90} height={30} src = "/Video_Icon.svg" alt = "Vido Logo"/>
            </span>
          </Link>
      </nav>
    );
}