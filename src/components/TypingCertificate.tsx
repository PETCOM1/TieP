import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

interface CertificateProps {
  name: string;
  wpm: number;
  accuracy: number;
  date: string;
  verifyId: string;
}

// StyleSheet for PDF layout
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#faf9f6', // Premium ivory/cream
    padding: 24,
    width: '100%',
    height: '100%',
  },
  outerBorder: {
    border: '1.5px solid #7c3aed', // Purple outer ring
    flex: 1,
    padding: 6,
  },
  innerBorder: {
    border: '3px solid #d97706', // Gold/amber inner frame
    flex: 1,
    padding: 24,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  decorationCornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderTop: '2px solid #d97706',
    borderLeft: '2px solid #d97706',
  },
  decorationCornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderTop: '2px solid #d97706',
    borderRight: '2px solid #d97706',
  },
  decorationCornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 20,
    height: 20,
    borderBottom: '2px solid #d97706',
    borderLeft: '2px solid #d97706',
  },
  decorationCornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderBottom: '2px solid #d97706',
    borderRight: '2px solid #d97706',
  },
  header: {
    fontSize: 10,
    fontFamily: 'Courier-Bold',
    color: '#7c3aed',
    textAlign: 'center',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginTop: 15,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Times-Bold',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 15,
  },
  divider: {
    width: 140,
    height: 1.5,
    backgroundColor: '#d97706',
    marginVertical: 12,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Oblique',
    color: '#64748b',
    textAlign: 'center',
  },
  name: {
    fontSize: 32,
    fontFamily: 'Times-Bold',
    color: '#d97706',
    textAlign: 'center',
    marginVertical: 10,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#475569',
    textAlign: 'center',
    maxWidth: 480,
    lineHeight: 1.5,
    marginBottom: 15,
  },
  statsBox: {
    flexDirection: 'row',
    border: '1px solid rgba(124, 58, 237, 0.2)',
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    width: 320,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  statLbl: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#7c3aed',
    marginTop: 3,
  },
  statSep: {
    width: 1,
    height: 25,
    backgroundColor: '#cbd5e1',
  },
  sealContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  sealCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    border: '1.5px solid #d97706',
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#b45309',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 'auto',
    paddingBottom: 10,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
  },
  verifyText: {
    fontSize: 7,
    fontFamily: 'Courier',
    color: '#94a3b8',
  },
  dateText: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#64748b',
  },
});

export const TypingCertificate: React.FC<CertificateProps> = ({
  name,
  wpm,
  accuracy,
  date,
  verifyId,
}) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Decorative Corner Accents */}
            <View style={styles.decorationCornerTL} />
            <View style={styles.decorationCornerTR} />
            <View style={styles.decorationCornerBL} />
            <View style={styles.decorationCornerBR} />

            {/* Header */}
            <Text style={styles.header}>Tie Pit Typing Academy</Text>
            
            {/* Title */}
            <Text style={styles.title}>Certificate of Touch-Typing Proficiency</Text>
            
            <View style={styles.divider} />
            
            {/* Recipient */}
            <Text style={styles.subtitle}>This certifies that the proficiency standards of</Text>
            <Text style={styles.name}>{name}</Text>
            
            {/* Description */}
            <Text style={styles.description}>
              has been successfully verified under standardized training conditions on the Tie Pit platform, achieving the following touch-typing milestones:
            </Text>

            {/* Stats */}
            <View style={styles.statsBox}>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{wpm} WPM</Text>
                <Text style={styles.statLbl}>TYPING SPEED</Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{accuracy}%</Text>
                <Text style={styles.statLbl}>ACCURACY</Text>
              </View>
            </View>

            {/* Seal */}
            <View style={styles.sealContainer}>
              <View style={styles.sealCircle}>
                <Text style={styles.sealText}>🏆</Text>
                <Text style={styles.sealText}>VERIFIED</Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.verifyText}>VERIFICATION KEY: {verifyId}</Text>
              <Text style={styles.dateText}>Date: {date}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
