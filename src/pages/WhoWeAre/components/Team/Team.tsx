import { teamSection, type TeamMember } from '../../whoWeAreData';
import styles from './Team.module.css';

const DesktopMemberCard = ({ member }: { member: TeamMember }) => {
  return (
    <article className={styles.personCard}>
      <div className={styles.personImageWrap} style={{ backgroundColor: member.imageBg }}>
        <img
          src={member.image}
          alt={`${member.firstName} ${member.lastName}`}
          className={styles.personImage}
        />
      </div>
      <div className={styles.personBody}>
        <div className={styles.personNameBlock}>
          <h3 className={styles.personName}>{member.firstName}</h3>
          <h3 className={styles.personName}>{member.lastName}</h3>
        </div>
        <p className={styles.personBio}>{member.bio}</p>
      </div>
    </article>
  );
};

const MobileMemberCard = ({ member }: { member: TeamMember }) => {
  return (
    <article className={styles.stackCard}>
      <div className={styles.stackMedia}>
        <img
          src={member.image}
          alt={`${member.firstName} ${member.lastName}`}
          className={styles.stackImage}
        />
        <div className={styles.stackOverlay} aria-hidden />
        <div className={styles.stackTitle}>
          <h3 className={styles.stackName}>{member.firstName}</h3>
          <h3 className={styles.stackName}>{member.lastName}</h3>
        </div>
      </div>
      <div className={styles.stackDetail}>
        <p className={styles.stackBio}>{member.bio}</p>
      </div>
    </article>
  );
};

const Team = () => {
  return (
    <section className={styles.peopleSection}>
      <header className={styles.teamHeader}>
        <h2 className={styles.teamTitle}>{teamSection.title}</h2>
        <p className={styles.teamIntro}>{teamSection.intro}</p>
      </header>

      <div className={styles.teamGrid}>
        {teamSection.members.map((member) => (
          <DesktopMemberCard key={member.lastName} member={member} />
        ))}
      </div>

      <div className={styles.teamStack}>
        {teamSection.members.map((member) => (
          <MobileMemberCard key={member.lastName} member={member} />
        ))}
      </div>
    </section>
  );
};

export default Team;
