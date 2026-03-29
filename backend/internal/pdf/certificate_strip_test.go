package pdf

import (
	"os"
	"path/filepath"
	"testing"
)

func TestStripFormFieldsFromCertificateTemplate(t *testing.T) {
	root := filepath.Join("..", "..", "..", "public", "Certificate-tem.pdf")
	b, err := os.ReadFile(root)
	if err != nil {
		t.Skip("template not in workspace:", err)
	}
	out, err := stripFormFieldsFromPDF(b)
	if err != nil {
		t.Fatal(err)
	}
	if len(out) < 1024 {
		t.Fatalf("unexpected output size %d", len(out))
	}
}
