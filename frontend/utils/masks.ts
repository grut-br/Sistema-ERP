export const cleanNonDigits = (value: string) => {
  return value.replace(/\D/g, "")
}

export const formatCNPJ = (value: string) => {
  // Limit to 14 digits max
  const cleanValue = cleanNonDigits(value).slice(0, 14)
  
  // Apply mask: XX.XXX.XXX/XXXX-XX
  return cleanValue
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

export const formatPhone = (value: string) => {
  // Limit to 11 digits max (Mobile)
  const cleanValue = cleanNonDigits(value).slice(0, 11)
  
  // Mask logic
  if (cleanValue.length <= 10) {
    // (XX) XXXX-XXXX (Landline or incomplete)
    return cleanValue
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
  } else {
    // (XX) XXXXX-XXXX (Mobile)
    return cleanValue
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
  }
}
