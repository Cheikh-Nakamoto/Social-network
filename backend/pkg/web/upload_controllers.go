package web

import (
	"backend/pkg/utils"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func RegisterRoutes(routes *http.ServeMux) *http.ServeMux {
	fmt.Println("register route upload")
	err := utils.Environment()
	if err != nil {
		log.Println(err)
		return routes
	}
	fmt.Println("Affectation du route sn/api/upload")
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/upload", UploadImage)
	return routes
}

// UploadImage handler
func UploadImage(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form, with a maximum upload of 10MB files
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		fmt.Println("Unable to parse multipart form")
		http.Error(w, "Unable to parse multipart form", http.StatusBadRequest)
		return
	}

	// Retrieve the file from form data
	file, handler, err := r.FormFile("file")
	if err != nil {
		fmt.Println("Error retrieving the file")
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Create a temporary file within our uploads directory
	uploadDir := "./public"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.MkdirAll(uploadDir, 0755)
	}

	// Create a unique file name
	fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), filepath.Ext(handler.Filename))
	filePath := filepath.Join(uploadDir, fileName)

	tempFile, err := os.Create(filePath)
	if err != nil {
		fmt.Println("Unable to create the file for writing")
		http.Error(w, "Unable to create the file for writing", http.StatusInternalServerError)
		return
	}
	defer tempFile.Close()

	// Copy the uploaded file to the temporary file
	_, err = io.Copy(tempFile, file)
	if err != nil {
		fmt.Println("Unable to save the file")
		http.Error(w, "Unable to save the file", http.StatusInternalServerError)
		return
	}

	// Retrieve other form values
	title := r.FormValue("title")
	content := r.FormValue("content")
	categories := r.FormValue("categories")
	privacy := r.FormValue("privacy")
	userID := r.FormValue("user_id")
	groupid := r.FormValue("group_id")

	// Construct the response data
	responseData := map[string]string{
		"title":      title,
		"content":    content,
		"image":      "/assets/" + fileName,
		"categories": categories,
		"ispublic":   privacy,
		"user_id":    userID,
		"group_id":   groupid,
	}

	

	// Send back the response data as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(responseData)
}
