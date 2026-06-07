import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/useToast';
import { formatErrorForUser } from '@/lib/errorFormatter';
import { logger } from '@/lib/logger';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Id } from '@/convex/_generated/dataModel';

const REPORT_REASONS = [
  { key: 'spam', label: 'Spam' },
  { key: 'harassment', label: 'Harassment' },
  { key: 'nudity', label: 'Nudity' },
  { key: 'violence', label: 'Violence' },
  { key: 'other', label: 'Other' },
] as const;

type ReportReason = typeof REPORT_REASONS[number]['key'];

type ReportModalProps = {
  visible: boolean;
  onClose: () => void;
  postId: Id<"posts">;
};

export default function ReportModal({ visible, onClose, postId }: ReportModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const createReport = useMutation(api.reports.createReport);

  const handleReport = async (reason: ReportReason) => {
    if (submitting) return;

    setSubmitting(true);
    try {
      await createReport({ postId, reason });
      showToast('Report submitted. Thank you for helping keep our community safe.', 'success');
      onClose();
    } catch (error) {
      logger.error("Error submitting report:", error);
      showToast(formatErrorForUser(error), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Report</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subtitle}>Why are you reporting this post?</Text>

        <View style={styles.reasonsList}>
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.key}
              style={styles.reasonRow}
              onPress={() => handleReport(reason.key)}
              disabled={submitting}
            >
              <Text style={styles.reasonText}>{reason.label}</Text>
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.grey} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.grey} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: COLORS.background,
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 44 : 0,
    marginBottom: Platform.OS === 'ios' ? 44 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surface,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: COLORS.grey,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  reasonsList: {
    paddingHorizontal: 16,
  },
  reasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surface,
  },
  reasonText: {
    color: COLORS.white,
    fontSize: 16,
  },
});
