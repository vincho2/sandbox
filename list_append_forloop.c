#include <stdio.h>
#include <stdlib.h>

const int NB = 10;

typedef struct node
{
    int number;
    struct node *next;
} node;

void free_memory(node *list);

int main(void)
{
    // Build initial list
    node *list = malloc(sizeof(node));
    if (list == NULL)
    {
        return 1;
    }
    list->next = NULL;

    node *n = list;
    node *pn = NULL;

    for (int i = 0; i < NB; i++)
    {
        pn = n;
        node *nx = malloc(sizeof(node));
        if (nx == NULL)
        {
            free_memory(list);
            return 1;
        }
        n->number = i + 1;
        n->next = nx;
        // nx->next = NULL;
        n = nx;      
    }
    pn->next = NULL;

    // Add new element
    int new_element = NB + 1;
    node *nd = malloc(sizeof(node));
    if (nd == NULL)
    {
        free_memory(list);
        return 1;
    }
    nd->number = new_element;
    nd->next = NULL;

    if (list == NULL)
    {
        list = nd;
    }
    else
    {
        for (node *ptr = list; ptr != nd; ptr = ptr->next)
        {
            if (ptr->next == NULL)
            {
                ptr->next = nd;
            }
        }
    }

    // Print numbers
    n = list;

    while (n != NULL)
    {
        printf("%i\n", n->number);
        n = n->next;
    }

free_memory(list);

}

// Free memory
void free_memory(node *list)
{

    node *tmp = NULL;
    while (list != NULL)
    {
        tmp = list->next;
        free(list);
        list = tmp;
    }
}
    