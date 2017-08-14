var MyForm = {
    getData: function()
    {
        var result = new Object();

        var inputs = document.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; ++i)
        {
            if (inputs[i].type !== "submit")
            {
                result[inputs[i].name] = inputs[i].value;
            }
        }
        return result;
    },

    setData: function(data)
    {
        if (data == null)
        {
            return;
        }

        var inputs = document.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; ++i)
        {
            if (   inputs[i].type !== "submit"
                && data.hasOwnProperty(inputs[i].name))
            {
                inputs[i].value = data[inputs[i].name];
            }
        }
    },
    
    submit: function()
    {
        var validationResult = this.validate();
        if (validationResult != null)
        {
            if (validationResult['isValid'] === true)
            {
                this.sendRequest(this.getData());
            }
            else
            {
                this.highlightErrorFields(validationResult['errorFields']);
            }
        }
    },
    
    validate: function()
    {
        console.log("validate");
        // TODO
        // var result = this.getData();
       
        var result = { isValid: true, errorFields: [] };
        
        return result;
    },
    
    sendRequest: function(data)
    {
        if (data == null)
        {
            return;
        }

        var path = document.getElementById("myForm").action;
        var params = [];
        for (var key in data)
        {
            if (data.hasOwnProperty(key))
            {
                params.push(key + "=" + data[key]);
            }
        }

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", path, true);
        xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlhttp.onreadystatechange = function()
            {
                if (xmlhttp.readyState != 4)
                {
                    return;
                }
                if (xmlhttp.status == 200)
                {
                    MyForm.processResponse(xmlhttp.responseText.trim());
                }
                xmlhttp.onreadystatechange = null;
                xmlhttp = null;
            };
        xmlhttp.send(params.join("&"));

        this.setSubmitButtonEnabled(false);

        var output = document.getElementById("resultContainer");
        this.setElementClass(output, "success",  false);
        this.setElementClass(output, "error",    false);
        this.setElementClass(output, "progress", false);

        this.setElementClass(document.getElementById("progressContainer"), "progress", true);
    },

    highlightErrorFields: function(fieldsNames)
    {
        var inputs = document.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; ++i)
        {
            if (inputs[i].type !== "submit")
            {
                if (~fieldsNames.indexOf(inputs[i].name))
                {
                    setErrorClass(inputs[i]);
                }
                else
                {
                    resetErrorClass(inputs[i]);
                }
            }
        }
    },

    processResponse: function(response)
    {
        this.setElementClass(document.getElementById("progressContainer"), "progress", false);
        
        var answer = JSON.parse(response);
        switch (answer.status)
        {
        case "success":
            this.processSuccess(answer);
            break;
        case "error":
            this.processError(answer);
            break;
        case "progress":
        default:
            this.processProgress(answer);
            break;
        }

        this.setSubmitButtonEnabled(true);
    },

    setSubmitButtonEnabled: function(isEnabled)
    {
        var submitButton = document.getElementById("submitButton");
        if (isEnabled)
        {
            submitButton.removeAttribute("disabled");
        }
        else
        {
            submitButton.setAttribute("disabled", true);
        }
    },

    setElementClass: function(element, className, isSet = true)
    {
        if (element != null)
        {
            var classes = element.className.split(/[\s]+/);
            if (classes.length > 0)
            {
                var index = classes.indexOf(className);
                if (isSet)
                {
                    if (index < 0)
                    {
                        classes.push(className);
                    }
                }
                else
                {
                    if (index >= 0)
                    {
                        classes.splice(index, 1);
                    }
                }
            }
            element.className = classes.join(" ");
        }
    },

    setErrorClass: function(element, isSet)
    {
        this.setElementClass(element, "error", isSet);
    },

    resetErrorClass: function(element)
    {
        this.setErrorClass(element, false);
    },

    processSuccess: function(data)
    {
        var output = document.getElementById("resultContainer");
        this.setElementClass(output, "success");
        output.innerHTML = "Success";
    },

    processError: function(data)
    {
        var output = document.getElementById("resultContainer");
        this.setErrorClass(output);
        output.innerHTML = data["reason"];
    },

    processProgress: function(data)
    {
        this.setElementClass(document.getElementById("progressContainer"), "progress");
        
        var output = document.getElementById("resultContainer");
        this.setElementClass(output, "progress");
        output.innerHTML = "";
        
        var timeout = data["timeout"];
        if (timeout <= 0)
        {
            timeout = 100;
        }
        var onTimeout = function()
            {
                clearInterval(MyForm.m_reloadTimer);
                MyForm.m_reloadTimer = null;
                MyForm.sendRequest(MyForm.getData());
            };
        MyForm.m_reloadTimer = setInterval(onTimeout, timeout);
    },

    m_reloadTimer: null

};

function on_submit(sender)
{
    MyForm.submit();
}

function on_change(sender)
{
    MyForm.resetErrorClass(sender);
}
