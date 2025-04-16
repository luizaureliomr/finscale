import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import theme from '../../theme';

export type CardVariant = 'default' | 'elevated' | 'outline';

interface CardBaseProps {
  variant?: CardVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface CardViewProps extends CardBaseProps, ViewProps {}
interface CardTouchableProps extends CardBaseProps, TouchableOpacityProps {}

/**
 * Componente Card sem interação
 */
export const Card: React.FC<CardViewProps> = ({
  variant = 'default',
  children,
  style,
  ...rest
}) => {
  return (
    <View
      style={[
        styles.container,
        getVariantStyle(variant),
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

/**
 * Componente Card com interação (touchable)
 */
export const TouchableCard: React.FC<CardTouchableProps> = ({
  variant = 'default',
  children,
  style,
  activeOpacity = 0.8,
  ...rest
}) => {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      style={[
        styles.container,
        getVariantStyle(variant),
        style,
      ]}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
};

/**
 * Helper para pegar o estilo baseado na variante
 */
const getVariantStyle = (variant: CardVariant): StyleProp<ViewStyle> => {
  switch (variant) {
    case 'elevated':
      return styles.elevated;
    case 'outline':
      return styles.outline;
    default:
      return styles.default;
  }
};

/**
 * Componente de cabeçalho do Card
 */
export const CardHeader: React.FC<{ style?: StyleProp<ViewStyle>, children: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.header, style]}>{children}</View>
);

/**
 * Componente de corpo do Card
 */
export const CardBody: React.FC<{ style?: StyleProp<ViewStyle>, children: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.body, style]}>{children}</View>
);

/**
 * Componente de rodapé do Card
 */
export const CardFooter: React.FC<{ style?: StyleProp<ViewStyle>, children: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.md,
  },
  default: {
    backgroundColor: theme.colors.background,
  },
  elevated: {
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outline: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  body: {
    padding: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default Card; 